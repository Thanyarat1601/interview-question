package database

import (
	"log"

	"example.com/interview-question-tcc-thaibev/backend/internal/config"
	q01 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q01_person"
	q02 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q02_auth"
	q03 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q03_approval"
	q04 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q04_profile"
	q05 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q05_queue"
	q06 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q06_barcode"
	q07 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q07_qrcode"
	q08 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q08_exam_admin"
	q09 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q09_comment"
	q10 "example.com/interview-question-tcc-thaibev/backend/internal/modules/q10_exam"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
}

func Migrate(db *gorm.DB) error {
	log.Println("running auto migration...")
	return db.AutoMigrate(
		&q01.Person{},
		&q02.User{},
		&q03.Document{},
		&q04.Profile{},
		&q05.QueueState{},
		&q06.BarcodeProduct{},
		&q07.QRProduct{},
		&q08.Exam{},
		&q09.Comment{},
		&q10.Question{},
		&q10.Submission{},
		&q10.Answer{},
	)
}

func Seed(db *gorm.DB) error {
	if err := q03.Seed(db); err != nil {
		return err
	}
	if err := q08.Seed(db); err != nil {
		return err
	}
	if err := q10.Seed(db); err != nil {
		return err
	}
	return nil
}
