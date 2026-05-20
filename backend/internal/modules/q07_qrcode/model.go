package q07_qrcode

import (
	"regexp"
	"time"
)

// Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (30 chars + 5 dashes), uppercase + digits.
var CodeRegex = regexp.MustCompile(`^[A-Z0-9]{5}(-[A-Z0-9]{5}){5}$`)

type QRProduct struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ProductCode string    `json:"product_code" gorm:"size:35;uniqueIndex;not null"`
	CreatedAt   time.Time `json:"created_at"`
}

func (QRProduct) TableName() string { return "q07_qr_products" }

type CreateInput struct {
	ProductCode string `json:"product_code" binding:"required"`
}
