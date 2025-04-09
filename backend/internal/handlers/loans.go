package handlers

import (
	"net/http"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

type createLoanReq struct {
	CustomerID  uint32  `json:"customer_id" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Amount      float64 `json:"amount"      binding:"required"`
}

func (s *Server) createLoan(ctx *gin.Context) {
	var req createLoanReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}
	loan, err := s.repo.LoanRepo.CreateLoan(ctx, &repository.Loan{
		CustomerID:  req.CustomerID,
		Description: req.Description,
		Amount:      req.Amount,
	})
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": loan})
}

func (s *Server) listLoans(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StringToUint32(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StringToUint32(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	loans, metadata, err := s.repo.LoanRepo.ListLoan(
		ctx,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": loans, "metadata": metadata})
}

func (s *Server) getLoan(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	loan, err := s.repo.LoanRepo.GetLoan(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": loan})
}

func (s *Server) deleteLoan(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	if err := s.repo.LoanRepo.DeleteLoan(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}
