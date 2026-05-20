package router

import (
	"net/http"
	"time"

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
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(cfg *config.Config, db *gorm.DB) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	q01.RegisterRoutes(api, db)
	q02.RegisterRoutes(api, db, cfg)
	q03.RegisterRoutes(api, db)
	q04.RegisterRoutes(api, db)
	q05.RegisterRoutes(api, db)
	q06.RegisterRoutes(api, db)
	q07.RegisterRoutes(api, db)
	q08.RegisterRoutes(api, db)
	q09.RegisterRoutes(api, db)
	q10.RegisterRoutes(api, db)

	return r
}
