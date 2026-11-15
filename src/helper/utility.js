import axios from 'axios';

// Utility function to call the BOC hash API using axios
export async function getBocHashFromApi(bocBase64) {
  const apiUrl = "https://boc-service-416f8b6d0c68.herokuapp.com/get-boc-hash";

  try {
    // Send a POST request with the BOC base64 string
    const response = await axios.post(apiUrl, { bocBase64 });

    // Return the hash from the response
    return response.data.hash;
  } catch (error) {
    console.error('Failed to get BOC hash:', error.message);
    throw error;
  }
}

export const decodeURIToJSON = (queryString) => {
  const decodedString = decodeURIComponent(queryString);
  const params = new URLSearchParams(decodedString);

  // Create an empty object to store the parsed parameters
  const result = {};

  // Iterate over each key-value pair and add it to the result object
  for (const [key, value] of params.entries()) {
      // If the value is a JSON string, parse it as JSON
      try {
          result[key] = JSON.parse(value);
      } catch (e) {
          // If parsing fails, just store the raw value as a string
          result[key] = value;
      }
  }

  return result;
};
