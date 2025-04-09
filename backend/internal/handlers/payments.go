package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

func (s *Server) paymentCallback(ctx *gin.Context) {
	var rq any
	if err := ctx.ShouldBindJSON(&rq); err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"ResultCode": 400,
			"ResultDesc": "Rejected",
		})

		return
	}

	req, _ := rq.(map[string]interface{})

	amountFlt, err := strconv.ParseFloat(req["TransAmount"].(string), 64)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, gin.H{
			"ResultCode": 400,
			"ResultDesc": "Rejected",
		})

		return
	}

	callbackData := &repository.Payment{
		TransactionNumber: req["TransID"].(string),
		TransactionSource: "MPESA",
		PayingName:        req["FirstName"].(string),
		Amount:            amountFlt,
		PaidAt:            time.Now(),
		Assigned:          false,
	}

	id, err := s.repo.CustomerRepo.GetCustomerIDByName(
		ctx,
		strings.ToUpper(callbackData.PayingName),
	)
	if err != nil {
		// log the payment to db

		if pkg.ErrorCode(err) != pkg.NOT_FOUND_ERROR {
			log.Println(err)
			ctx.JSON(http.StatusOK, gin.H{
				"ResultCode": 400,
				"ResultDesc": "Rejected",
			})

			return
		}
	}
	if id != 0 {
		callbackData.AssignedTo = id
		callbackData.Assigned = true
	}

	_, err = s.repo.PaymentRepo.CreatePayment(
		ctx,
		callbackData,
		s.taskDistributor.DistributeTaskSendSMS,
	)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, gin.H{
			"ResultCode": 400,
			"ResultDesc": "Rejected",
		})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ResultCode": 200,
		"ResultDesc": "Accepted",
	})
}

type createPaymentReq struct {
	TransactionNumber string    `json:"transaction_number" binding:"required"`
	TransactionSource string    `json:"transaction_source" binding:"required"`
	PayingName        string    `json:"paying_name"        binding:"required"`
	Amount            float64   `json:"amount"             binding:"required"`
	AssignedTo        uint32    `json:"assigned_to"        binding:"required"`
	PaidAt            time.Time `json:"paid_at"`
}

func (s *Server) createPayment(ctx *gin.Context) {
	var req createPaymentReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	payment := &repository.Payment{
		TransactionNumber: req.TransactionNumber,
		TransactionSource: req.TransactionSource,
		PayingName:        req.PayingName,
		Amount:            req.Amount,
		AssignedTo:        req.AssignedTo,
		Assigned:          true,
	}

	if req.PaidAt != (time.Time{}) {
		payment.PaidAt = req.PaidAt
	} else {
		payment.PaidAt = time.Now()
	}

	payment, err := s.repo.PaymentRepo.CreatePayment(
		ctx,
		payment,
		s.taskDistributor.DistributeTaskSendSMS,
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": payment})
}

func (s *Server) listPayments(ctx *gin.Context) {
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

	fromDateStr := ctx.DefaultQuery("from", "01/01/2025")
	fromDate, err := time.Parse("01/02/2006", fromDateStr)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			errorResponse(
				pkg.Errorf(pkg.INTERNAL_ERROR, "error parsing from date: %s", err.Error()),
			),
		)

		return
	}

	toDateStr := ctx.DefaultQuery("to", time.Now().Format("01/02/2006"))
	toDate, err := time.Parse("01/02/2006", toDateStr)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			errorResponse(
				pkg.Errorf(pkg.INTERNAL_ERROR, "error parsing from date: %s", err.Error()),
			),
		)

		return
	}
	toDate = toDate.Add(24 * time.Hour)

	payments, metadata, err := s.repo.PaymentRepo.ListPayments(
		ctx,
		&pkg.PaginationMetadata{
			CurrentPage: pageNo,
			PageSize:    pageSize,
			FromDate:    &fromDate,
			ToDate:      &toDate,
		},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": payments, "metadata": metadata})
}

func (s *Server) getPayment(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	payment, err := s.repo.PaymentRepo.GetPayment(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": payment})
}

func (s *Server) assignPayment(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	loanID, err := pkg.StringToUint32(ctx.Query("customerId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	if err := s.repo.PaymentRepo.AssignPayment(ctx, id, loanID, s.taskDistributor.DistributeTaskSendSMS); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}
