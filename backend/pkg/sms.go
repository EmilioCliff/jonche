package pkg

import (
	"bytes"
	"html/template"
)

type CustomerTemplateParams struct {
	Name        string
	PhoneNumber string
	Loaned      float64
	Paid        float64
	PaidDate    string
}

// "Hello {{.Name}}, of phoneNumber {{.PhoneNumber}} we have received your payment{{.Paid}}. Your
// new balance is KES {{.Loaned}}. Thank you!"
func GenerateMessages(templateText string, customers []CustomerTemplateParams) ([]string, error) {
	tmpl, err := template.New("sms").Parse(templateText)
	if err != nil {
		return nil, Errorf(INTERNAL_ERROR, "failed creating template: %s", err.Error())
	}

	var messages []string
	for _, customer := range customers {
		var msgBuffer bytes.Buffer
		err := tmpl.Execute(&msgBuffer, customer)
		if err != nil {
			return nil, Errorf(INTERNAL_ERROR, "failed executing template: %s", err.Error())
		}
		messages = append(messages, msgBuffer.String())
	}

	return messages, nil
}
