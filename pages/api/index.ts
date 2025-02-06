import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ type: 'error', message: `Method ${req.method} Not Allowed` });
  }

  // Set CORS and content type headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Parse the request body
  let url: string;
  let customHeaders: Record<string, string> = {};
  let postData: any = {};
  try {
    const body = JSON.parse(req.body);
    url = body.url;
    if (!url) {
      return res.status(400).json({ type: 'error', message: 'Missing "my-url" in request body.' });
    }
    // Optional: extract custom headers if provided
    if (body.headers && typeof body.headers === 'object') {
      customHeaders = body.headers;
    }
    // Optional: extract data for the POST request
    if (body.data && typeof body.data === 'object') {
      postData = body.data;
    }
  } catch (err) {
    return res.status(400).json({ type: 'error', message: 'Invalid JSON in request body.' });
  }

  // Make the POST request with axios including the custom headers and data
  try {
    const response = await axios.post(url, postData, { headers: customHeaders });

    // Forward any non-200 response from the external service
    if (response.status !== 200) {
      return res.status(response.status).json({ type: 'error', message: response.statusText });
    }

    // Return the external response data as JSON
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.message, "ERR");
    return res.status(500).json({ type: 'error', message: error.message });
  }
}
