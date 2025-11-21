db.createUser({
  user: "weather_user",
  pwd: "weather_pass",
  roles: [
    {
      role: "readWrite",
      db: "weather_db"
    }
  ]
});

db.createCollection("weather_logs");
db.createCollection("users");