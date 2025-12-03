import { Connection } from 'mongoose';
import { DatabaseConnectionException } from '../../common/exceptions/database-connection.exception';

/**
 * Verifica se a conexão com MongoDB está ativa
 *
 * @param connection - Conexão do Mongoose
 * @throws DatabaseConnectionException se a conexão não estiver ativa
 */
export function ensureDatabaseConnection(connection: Connection): void {
  if (connection.readyState !== 1) {
    throw new DatabaseConnectionException(connection.readyState);
  }
}

