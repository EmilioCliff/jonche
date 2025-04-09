package handlers

import (
	"net/http"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

type createCustomerRequest struct {
	Name        string `json:"name"         binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

func (s *Server) createCustomer(ctx *gin.Context) {
	var req createCustomerRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	customer, err := s.repo.CustomerRepo.CreateCustomer(ctx, &repository.Customer{
		Name:        req.Name,
		PhoneNumber: req.PhoneNumber,
	})
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": customer})
}

func (s *Server) listCustomers(ctx *gin.Context) {
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

	customers, metadata, err := s.repo.CustomerRepo.ListCustomers(
		ctx,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"metadata": metadata,
		"data":     customers,
	})
}

func (s *Server) getCustomer(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	client, err := s.repo.CustomerRepo.GetCustomer(ctx, id, "")
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": client})
}

func (s Server) getCustomerLoans(ctx *gin.Context) {
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

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	customersLoans, metadata, err := s.repo.LoanRepo.ListCustomerLoans(
		ctx,
		id,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"metadata": metadata,
		"data":     customersLoans,
	})
}

func (s Server) getCustomerPaymens(ctx *gin.Context) {
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

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	customersPayments, metadata, err := s.repo.PaymentRepo.ListCustomerPayments(
		ctx,
		id,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"metadata": metadata,
		"data":     customersPayments,
	})
}

func (s Server) getCustomerSms(ctx *gin.Context) {
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

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	customersSMS, metadata, err := s.repo.SMSRepo.ListCustomerSMS(
		ctx,
		id,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"metadata": metadata,
		"data":     customersSMS,
	})
}

func (s *Server) getCustomerFullData(ctx *gin.Context) {
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

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	client, err := s.repo.CustomerRepo.GetCustomerFullData(
		ctx,
		id,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": client})
}

type updateCustomerDetailsReq struct {
	Name        string `json:"name"`
	PhoneNumber string `json:"phone_number"`
	Status      string `json:"status"       binding:"oneof=true false"`
}

func (s *Server) updateCustomerDetails(ctx *gin.Context) {
	var req updateCustomerDetailsReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	params := &repository.UpdateCustomer{
		ID: id,
	}

	if req.Name != "" {
		params.Name = &req.Name
	}

	if req.PhoneNumber != "" {
		params.PhoneNumber = &req.PhoneNumber
	}

	if req.Status != "" {
		status := req.Status == "true"
		params.Status = &status
	}

	customer, err := s.repo.CustomerRepo.UpdateCustomerDetails(ctx, params)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": customer})
}

func (s *Server) deleteCustomers(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	if err := s.repo.CustomerRepo.DeleteCustomer(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}
