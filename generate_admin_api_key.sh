#!/bin/bash

# Function to generate a random string of given length
generate_string() {
  local length=$1

  # Check for invalid length
  if [ "$length" -le 0 ] || [ "$length" -gt 200 ]; then
    echo "Length must be between 1 and 200 characters"
    exit 1
  fi

  # Characters to choose from
  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  random_string=""

  # Generate random string
  for ((i = 0; i < length; i++)); do
    random_char="${characters:RANDOM % ${#characters}:1}"
    random_string="$random_string$random_char"
  done

  # Regular expressions for matching
  string_regex_num='[0-9]'
  uppercase_regex='[A-Z]'
  lowercase_regex='[a-z]'

  # Check if string contains at least one uppercase letter, one number, and one lowercase letter
  if ! echo "$random_string" | grep -qP "$uppercase_regex" || \
     ! echo "$random_string" | grep -qP "$string_regex_num" || \
     ! echo "$random_string" | grep -qP "$lowercase_regex"; then
    generate_string "$length" # Recursively generate again if conditions aren't met
  else
    echo "$random_string"  # Return the valid random string
  fi
}


VALUE_1=$(generate_string 5)  
VALUE_2=$(generate_string 12)  
VALUE_3=$(generate_string 8)  
VALUE_4=$(generate_string 20)  
SALT=$(generate_string 150)  

API_KEY="${VALUE_1}-${VALUE_2}_${VALUE_3}.${VALUE_4}"



# Check if .env file exists, if not create it
if [ ! -f .env ]; then
  touch .env
fi

# Check if API_KEY already exists in the .env file
if grep -q "ADMIN_API_KEY=" .env; then
  # If it exists, replace the existing API_KEY value
  sed -i "s/^ADMIN_API_KEY=.*/ADMIN_API_KEY=$API_KEY/" .env
else
  # If it doesn't exist, append the new API_KEY
  echo "ADMIN_API_KEY=$API_KEY" >> .env
fi

# Check if SALT already exists in the .env file
if grep -q "SALT=" .env; then
  # If it exists, replace the existing SALT value
  sed -i "s/^SALT=.*/SALT=$SALT/" .env
else
  # If it doesn't exist, append the new SALT
  echo "SALT=$SALT" >> .env
fi

# Optional: Confirm the change in .env
echo ""
echo "Updated .env with MAIN_API_KEY: $(grep 'API_KEY' .env) & SALT: $(grep 'SALT' .env)"