package q01_person

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q01")
	{
		g.GET("/persons", h.List)
		g.POST("/persons", h.Create)
		g.GET("/persons/:id", h.Get)
	}
}
