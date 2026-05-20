package q06_barcode

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q06")
	{
		g.GET("/products", h.List)
		g.POST("/products", h.Create)
		g.DELETE("/products/:id", h.Delete)
	}
}
