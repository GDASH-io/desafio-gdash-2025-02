package queue

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type MessageHandler func(ctx context.Context, body []byte) error

type Consumer struct {
	conn          *amqp.Connection
	channel       *amqp.Channel
	queueName     string
	prefetchCount int
	logger        *zap.Logger
}

func NewConsumer(url, queueName string, prefetchCount int, logger *zap.Logger) (*Consumer, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	if err := channel.Qos(prefetchCount, 0, false); err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to set QoS: %w", err)
	}

	logger.Info("Connected to RabbitMQ",
		zap.String("queue", queueName),
		zap.Int("prefetch", prefetchCount),
	)

	return &Consumer{
		conn:          conn,
		channel:       channel,
		queueName:     queueName,
		prefetchCount: prefetchCount,
		logger:        logger,
	}, nil
}

func (c *Consumer) Consume(ctx context.Context, handler MessageHandler) error {
	_, err := c.channel.QueueDeclare(
		c.queueName,
		true,  // durable
		false, // autoDelete
		false, // exclusive
		false, // noWait
		amqp.Table{
			amqp.QueueMessageTTLArg: 86400000,
			amqp.QueueMaxLenArg:     10000,
		}, // args
	)

	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	msgs, err := c.channel.Consume(
		c.queueName,
		"",    // consumer tag
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	c.logger.Info("Started consuming messages",
		zap.String("queue", c.queueName),
	)

	for {
		select {
		case <-ctx.Done():
			c.logger.Info("Context cancellation")
			return ctx.Err()

		case msg, ok := <-msgs:
			if !ok {
				c.logger.Warn("Message channel closed")
				return fmt.Errorf("message channel closed")
			}

			c.processMessage(ctx, msg, handler)
		}
	}
}

func (c *Consumer) processMessage(ctx context.Context, msg amqp.Delivery, handler MessageHandler) {
	c.logger.Info("Received message",
		zap.Uint64("delivery_tag", msg.DeliveryTag),
		zap.Int("body_size", len(msg.Body)),
	)

	if err := handler(ctx, msg.Body); err != nil {
		c.logger.Error("Failed to process message",
			zap.Error(err),
			zap.Uint64("delivery_tag", msg.DeliveryTag),
		)

		if nackErr := msg.Nack(false, true); nackErr != nil {
			c.logger.Error("Failed to nack message", zap.Error(nackErr))
		}
		return
	}

	if err := msg.Ack(false); err != nil {
		c.logger.Error("Failed to nack message",
			zap.Error(err),
			zap.Uint64("delivery_tag", msg.DeliveryTag),
		)
		return
	}

	c.logger.Info("Successfully processed and acked message",
		zap.Uint64("delivery_tag", msg.DeliveryTag),
	)
}

func (c *Consumer) Close() error {
	c.logger.Info("Closing RabbitMQ connection")

	if err := c.channel.Close(); err != nil {
		c.logger.Error("Failed to close channel", zap.Error(err))
	}

	if err := c.conn.Close(); err != nil {
		c.logger.Error("Failed to close connection", zap.Error(err))
		return err
	}

	return nil
}
