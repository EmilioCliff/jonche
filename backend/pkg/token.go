package pkg

import (
	"crypto/rsa"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	TokenIssuer = "JONCHE_APP"
)

type Payload struct {
	ID     uuid.UUID `json:"id"`
	UserID uint32    `json:"user_id"`
	Name   string    `json:"name"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

type JWTMaker struct {
	PublicKey  *rsa.PublicKey
	PrivateKey *rsa.PrivateKey
	config     Config
}

func NewJWTMaker(privateKeyPEM string, publicKeyPEM string, config Config) (*JWTMaker, error) {
	if privateKeyPEM == "" || publicKeyPEM == "" {
		return nil, Errorf(INTERNAL_ERROR, "private key or public key is empty")
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKeyPEM))
	if err != nil {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse private key: %v", err)
	}

	publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
	if err != nil {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse public key: %v", err)
	}

	maker := &JWTMaker{
		PrivateKey: privateKey,
		PublicKey:  publicKey,
		config:     config,
	}

	return maker, nil
}

func (maker *JWTMaker) CreateToken(
	userID uint32,
	name string,
	email string,
	duration time.Duration,
) (string, error) {
	id, err := uuid.NewUUID()
	if err != nil {
		return "", Errorf(INTERNAL_ERROR, "failed to create uuid: %v", err)
	}

	claims := Payload{
		id,
		userID,
		name,
		email,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    TokenIssuer,
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	token, err := jwtToken.SignedString(maker.PrivateKey)
	if err != nil {
		return "", Errorf(INTERNAL_ERROR, "failed to create token: %v", err)
	}

	return token, nil
}

func (maker *JWTMaker) VerifyToken(token string) (*Payload, error) {
	keyFunc := func(token *jwt.Token) (any, error) {
		_, ok := token.Method.(*jwt.SigningMethodRSA)
		if !ok {
			return nil, Errorf(INTERNAL_ERROR, "unexpected signing method")
		}

		return maker.PublicKey, nil
	}

	jwtToken, err := jwt.ParseWithClaims(token, &Payload{}, keyFunc)
	if err != nil {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse token: %v", err)
	}

	payload, ok := jwtToken.Claims.(*Payload)
	if !ok {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse token is invalid")
	}

	if payload.RegisteredClaims.Issuer != TokenIssuer {
		return nil, Errorf(INTERNAL_ERROR, "invalid issuer")
	}

	if payload.RegisteredClaims.ExpiresAt.Time.Before(time.Now()) {
		return nil, Errorf(INTERNAL_ERROR, "token is expired")
	}

	return payload, nil
}

func (maker *JWTMaker) GetPayload(token string) (*Payload, error) {
	parser := jwt.NewParser()

	jwtToken, _, err := parser.ParseUnverified(token, &Payload{})
	if err != nil {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse token: %v", err)
	}

	_, ok := jwtToken.Method.(*jwt.SigningMethodRSA)
	if !ok {
		return nil, Errorf(INTERNAL_ERROR, "unexpected signing method")
	}

	payload, ok := jwtToken.Claims.(*Payload)
	if !ok {
		return nil, Errorf(INTERNAL_ERROR, "failed to parse token is invalid")
	}

	if payload.RegisteredClaims.Issuer != TokenIssuer {
		return nil, Errorf(INTERNAL_ERROR, "invalid issuer")
	}

	return payload, nil
}
