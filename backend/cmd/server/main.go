package main

import (
	"log"

	"example.com/interview-question-tcc-thaibev/backend/internal/config"
	"example.com/interview-question-tcc-thaibev/backend/internal/database"
	"example.com/interview-question-tcc-thaibev/backend/internal/router"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	if err := database.Seed(db); err != nil {
		log.Fatalf("failed to seed database: %v", err)
	}

	r := router.New(cfg, db)

	log.Printf("server listening on :%s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
