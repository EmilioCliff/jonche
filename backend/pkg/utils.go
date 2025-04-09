package pkg

import (
	"strconv"
	"strings"
)

func StringToUint32(s string) (uint32, error) {
	if s == "" {
		return 0, Errorf(INVALID_ERROR, "id/page is required")
	}
	id, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0, Errorf(INVALID_ERROR, "invalid id/page: %s", err.Error())
	}

	return uint32(id), nil
}

func StringToFloat64(s string) (float64, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, Errorf(INVALID_ERROR, "input string is empty")
	}

	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, Errorf(INVALID_ERROR, "invalid float64 format: "+s)
	}

	return f, nil
}

func Float64ToString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}
