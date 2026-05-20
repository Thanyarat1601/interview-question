package q03_approval

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q03")
	{
		g.GET("/documents", h.List)
		g.PATCH("/documents/:id/approve", h.Approve)
		g.PATCH("/documents/:id/reject", h.Reject)
	}
}

func Seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&Document{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	seed := []Document{
		{Title: "ขอเบิกอุปกรณ์สำนักงาน", Description: "ขอเบิกหมึกเครื่องพิมพ์และกระดาษ A4 จำนวน 5 รีม", Status: StatusPending},
		{Title: "ขออนุมัติเดินทางไปประชุมต่างจังหวัด", Description: "ประชุมที่เชียงใหม่ วันที่ 1-3 มิถุนายน", Status: StatusPending},
		{Title: "ขออนุมัติทำงานล่วงเวลา", Description: "สำหรับ Sprint รอบ 25/26", Status: StatusPending},
		{Title: "ขออนุมัติการลาพักร้อน", Description: "ลาวันที่ 15-19 กรกฎาคม", Status: StatusPending},
		{Title: "ขออนุมัติการจัดซื้อ License Software", Description: "JetBrains All Products Pack ปีละ 1 license", Status: StatusPending},
	}
	return db.Create(&seed).Error
}
