package config

import (
	"fmt"
	"os"
)

type Config struct {
	AppPort     string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	JWTSecret   string
	JWTExpireHr int
}

func Load() *Config {
	// Cloud Run injects PORT — honor it; fall back to APP_PORT then 8080.
	port := os.Getenv("PORT")
	if port == "" {
		port = getEnv("APP_PORT", "8080")
	}
	return &Config{
		AppPort:    port,
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "interview_test"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		JWTSecret:  getEnv("JWT_SECRET", "change-me-in-production-please"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=UTC",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
