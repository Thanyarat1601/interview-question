package q02_auth

import "time"

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Username     string    `json:"username" gorm:"size:80;uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"size:255;not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (User) TableName() string { return "q02_users" }

type RegisterInput struct {
	Username        string `json:"username" binding:"required,min=3,max=80"`
	Password        string `json:"password" binding:"required,min=6,max=128"`
	ConfirmPassword string `json:"confirm_password" binding:"required,min=6,max=128"`
}

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	Username  string    `json:"username"`
	UserID    uint      `json:"user_id"`
}
