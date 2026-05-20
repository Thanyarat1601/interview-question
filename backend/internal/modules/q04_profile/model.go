package q04_profile

import "time"

type Profile struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	FullName   string    `json:"full_name" gorm:"size:200;not null"`
	Email      string    `json:"email" gorm:"size:200;not null"`
	Phone      string    `json:"phone" gorm:"size:30;not null"`
	BirthDate  time.Time `json:"birth_date" gorm:"not null"`
	Occupation string    `json:"occupation" gorm:"size:120;not null"`
	ImageData  string    `json:"image_data" gorm:"type:text"` // base64
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Profile) TableName() string { return "q04_profiles" }

type CreateProfileInput struct {
	FullName   string `json:"full_name" binding:"required,min=1,max=200"`
	Email      string `json:"email" binding:"required,email"`
	Phone      string `json:"phone" binding:"required"`
	BirthDate  string `json:"birth_date" binding:"required"` // DD/MM/YYYY
	Occupation string `json:"occupation" binding:"required"`
	ImageData  string `json:"image_data"`
}
