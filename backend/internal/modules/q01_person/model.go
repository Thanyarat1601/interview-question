package q01_person

import "time"

type Person struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	FirstName string    `json:"first_name" gorm:"size:120;not null"`
	LastName  string    `json:"last_name" gorm:"size:120;not null"`
	BirthDate time.Time `json:"birth_date" gorm:"not null"`
	Address   string    `json:"address" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Person) TableName() string { return "q01_persons" }

type PersonDTO struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	BirthDate string `json:"birth_date"`
	Age       int    `json:"age"`
	Address   string `json:"address"`
}

func ToDTO(p Person) PersonDTO {
	return PersonDTO{
		ID:        p.ID,
		FirstName: p.FirstName,
		LastName:  p.LastName,
		BirthDate: p.BirthDate.Format("2006-01-02"),
		Age:       CalculateAge(p.BirthDate, time.Now()),
		Address:   p.Address,
	}
}

func CalculateAge(birth, now time.Time) int {
	years := now.Year() - birth.Year()
	if now.YearDay() < birth.YearDay() {
		years--
	}
	if years < 0 {
		years = 0
	}
	return years
}

type CreatePersonInput struct {
	FirstName string `json:"first_name" binding:"required,min=1,max=120"`
	LastName  string `json:"last_name" binding:"required,min=1,max=120"`
	BirthDate string `json:"birth_date" binding:"required"`
	Address   string `json:"address" binding:"required"`
}
