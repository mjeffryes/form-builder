// Default form template with example controls
// This template demonstrates common field types and serves as the initial form for new users

export const DEFAULT_JSON_SCHEMA = JSON.stringify({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Contact Form",
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name",
      "minLength": 1
    },
    "lastName": {
      "type": "string",
      "title": "Last Name",
      "minLength": 1
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "age": {
      "type": "integer",
      "title": "Age",
      "minimum": 0,
      "maximum": 150
    },
    "birthdate": {
      "type": "string",
      "format": "date",
      "title": "Birth Date"
    },
    "country": {
      "type": "string",
      "title": "Country",
      "enum": ["USA", "Canada", "UK", "Australia", "Other"]
    },
    "subscribe": {
      "type": "boolean",
      "title": "Subscribe to Newsletter"
    }
  },
  "required": ["firstName", "lastName", "email"]
}, null, 2)

export const DEFAULT_UI_SCHEMA = JSON.stringify({
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/firstName"
    },
    {
      "type": "Control",
      "scope": "#/properties/lastName"
    },
    {
      "type": "Control",
      "scope": "#/properties/email"
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Control",
          "scope": "#/properties/age"
        },
        {
          "type": "Control",
          "scope": "#/properties/birthdate"
        }
      ]
    },
    {
      "type": "Control",
      "scope": "#/properties/country"
    },
    {
      "type": "Control",
      "scope": "#/properties/subscribe"
    }
  ]
}, null, 2)

export const DEFAULT_DATA = JSON.stringify({
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "birthdate": "1993-06-15",
  "country": "USA",
  "subscribe": true
}, null, 2)
