// Handle incoming requests
Deno.serve(async (req)=>{
  try {
    // CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers,
        status: 204
      });
    }
    // Parse request body
    const { to, from, message } = await req.json();
    // Validate required fields
    if (!to || !from || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required fields"
      }), {
        status: 400,
        headers
      });
    }
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      // Create Basic Auth header
      const authHeader = "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`);
      // Create form data for Twilio API
      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("From", from);
      formData.append("Body", message);
      // Send request to Twilio
      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: Deno.env.get("apiKey");,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });
      const twilioData = await twilioResponse.json();
      if (!twilioResponse.ok) {
        throw new Error(twilioData.message || "Failed to send SMS via Twilio");
      }
      return new Response(JSON.stringify({
        success: true,
        message: "SMS sent successfully",
        sid: twilioData.sid
      }), {
        headers
      });
    
  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "Failed to send SMS"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
