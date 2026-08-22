const API_URL = "http://localhost:5000/api/v1/notes";

const TOTAL_REQUESTS = 20;

interface CreateNoteResponse {
  success: boolean;
  data?: {
    token: string;
    expiresAt: string;
    url: string;
  };
  message?: string;
}

interface RevealResponse {
  success: boolean;
  data?: {
    secret?: string;
  };
  message?: string;
}

const main = async (): Promise<void> => {
  console.log("\n======================================");
  console.log("       VANISH ATOMIC REVEAL TEST");
  console.log("======================================\n");

  // -----------------------------------------
  // STEP 1: Create a fresh test note
  // -----------------------------------------

  console.log("Creating test note...");

  const createResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: "ATOMIC TEST SECRET",
      expiry: "1h",
    }),
  });

  const createData =
    (await createResponse.json()) as CreateNoteResponse;

  if (!createResponse.ok || !createData.success) {
    console.error("❌ Failed to create test note");
    console.error(createData);

    process.exit(1);
  }

  const token = createData.data?.token;

  if (!token) {
    console.error("❌ Token was not returned");

    process.exit(1);
  }

  console.log("✅ Test note created");
  console.log("Token:", token);

  // -----------------------------------------
  // STEP 2: Build reveal URL
  // -----------------------------------------

  const revealUrl =
    `${API_URL}/${token}/reveal`;

  console.log("\nReveal URL:");
  console.log(revealUrl);

  // -----------------------------------------
  // STEP 3: Create simultaneous requests
  // -----------------------------------------

  console.log(
    `\nSending ${TOTAL_REQUESTS} simultaneous requests...\n`
  );

  const requests = Array.from(
    { length: TOTAL_REQUESTS },
    async (_, index) => {
      const requestNumber = index + 1;

      try {
        const response = await fetch(revealUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const data =
          (await response.json()) as RevealResponse;

        return {
          requestNumber,
          statusCode: response.status,
          success: data.success,
          message: data.message,
          secret: data.data?.secret,
        };
      } catch (error) {
        return {
          requestNumber,
          statusCode: 0,
          success: false,
          message: "Request failed",
          secret: undefined,
          error,
        };
      }
    }
  );

  // -----------------------------------------
  // STEP 4: Wait for all requests
  // -----------------------------------------

  const results = await Promise.all(requests);

  // -----------------------------------------
  // STEP 5: Display results
  // -----------------------------------------

  console.log("RESULTS");
  console.log("--------------------------------------");

  for (const result of results) {
    console.log(
      `Request ${result.requestNumber}: ` +
      `HTTP ${result.statusCode} | ` +
      `${result.message ?? ""}`
    );

    if (result.secret) {
      console.log(
        `   🔥 SECRET RECEIVED: ${result.secret}`
      );
    }
  }

  console.log("--------------------------------------");

  // -----------------------------------------
  // STEP 6: Count results
  // -----------------------------------------

  const successfulReveals = results.filter(
    (result) =>
      result.statusCode === 200 &&
      result.success === true &&
      result.secret === "ATOMIC TEST SECRET"
  );

  const goneResponses = results.filter(
    (result) =>
      result.statusCode === 404 &&
      result.message === "This note is gone"
  );

  const otherResponses = results.filter(
    (result) =>
      result.statusCode !== 200 &&
      result.statusCode !== 404
  );

  // -----------------------------------------
  // STEP 7: Summary
  // -----------------------------------------

  console.log("\n======================================");
  console.log("             TEST SUMMARY");
  console.log("======================================");

  console.log(
    `Total requests:      ${TOTAL_REQUESTS}`
  );

  console.log(
    `Successful reveals:  ${successfulReveals.length}`
  );

  console.log(
    `Note gone responses: ${goneResponses.length}`
  );

  console.log(
    `Other responses:     ${otherResponses.length}`
  );

  // -----------------------------------------
  // STEP 8: Verify atomic behavior
  // -----------------------------------------

  console.log("\n======================================");

  if (
    successfulReveals.length === 1 &&
    goneResponses.length === TOTAL_REQUESTS - 1 &&
    otherResponses.length === 0
  ) {
    console.log(
      "🔥 ATOMIC READ-AND-BURN TEST PASSED"
    );

    console.log(
      "Exactly ONE request received the secret."
    );

    console.log(
      `The other ${TOTAL_REQUESTS - 1} requests received "This note is gone".`
    );

    console.log("======================================\n");

    process.exit(0);
  }

  console.log(
    "❌ ATOMIC READ-AND-BURN TEST FAILED"
  );

  console.log(
    `Expected 1 successful reveal, got ${successfulReveals.length}`
  );

  console.log("======================================\n");

  process.exit(1);
};

main().catch((error) => {
  console.error("\n❌ Test crashed:");
  console.error(error);

  process.exit(1);
});