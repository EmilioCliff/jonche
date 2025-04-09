package handlers

import (
	"net/http"

	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

func (s *Server) getCustomerList(ctx *gin.Context) {
	customerList, err := s.repo.CustomerRepo.GetCustomerList(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": customerList})
}

func (s *Server) getDashboardStats(ctx *gin.Context) {
	stats, err := s.repo.UserRepo.GetDashboardStats(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	overview, err := s.repo.UserRepo.GetDashboardOverview(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"stats": stats, "overview": overview})
}

func (s *Server) getDashboardOverview(ctx *gin.Context) {
	overview, err := s.repo.UserRepo.GetDashboardOverview(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": overview})
}
