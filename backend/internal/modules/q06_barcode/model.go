package q06_barcode

import (
	"regexp"
	"time"
)

// Format: XXXX-XXXX-XXXX-XXXX (16 chars + 3 dashes), uppercase A-Z and 0-9 only.
var CodeRegex = regexp.MustCompile(`^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`)

type BarcodeProduct struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ProductCode string    `json:"product_code" gorm:"size:19;not null"`
	CreatedAt   time.Time `json:"created_at"`
}

func (BarcodeProduct) TableName() string { return "q06_barcode_products" }

type CreateInput struct {
	ProductCode string `json:"product_code" binding:"required"`
}
