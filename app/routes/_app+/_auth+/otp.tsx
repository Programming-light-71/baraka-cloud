/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Form, Link, useFetcher } from "@remix-run/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import toast from "react-hot-toast";

import { OTPManager } from "~/utils/backend-utils/Queries/AuthManagement";
import { storeUserInSession } from "~/utils/backend-utils/CookieManager";

export async function action({ request }: ActionFunctionArgs) {
  const queryParams = new URL(request.url).searchParams;
  const queryEmail = queryParams.get("email");
  const queryOtp = queryParams.get("otp");
  const queryUserId = queryParams.get("userId");

  if (!queryEmail || !queryOtp || !queryUserId) {
    return Response.json(
      { success: false, message: "Invalid request Info" },
      { status: 405 }
    );
  }

  if (request.method !== "POST") {
    return Response.json(
      { success: false, message: "Invalid request method" },
      { status: 405 }
    );
  }

  try {
    const form = await request.formData();
    const otp = form.get("otp");

    // Validate OTP input
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return Response.json(
        { success: false, message: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // Fake verification logic (Replace with real OTP check)
    // console.log("params", queryEmail, queryOtp, queryUserId);
    const isValidOTP = otp === queryOtp; // Example valid OTP
    // console.log("isValidOTP", isValidOTP);
    if (!isValidOTP) {
      return Response.json(
        { success: false, message: "Incorrect OTP" },
        { status: 401 }
      );
    }

    // OTP verification successful
    const responseData = await OTPManager({
      otp,
      email: queryEmail as string,
      userId: queryUserId as string,
    });

    // console.log("responseData OTP", responseData);

    if (!(responseData instanceof Response) && !responseData?.success) {
      return Response.json(
        { success: false, message: "OTP invalid or Expired" },
        { status: 500 }
      );
    }
    if (responseData instanceof Response) {
      return responseData;
    }

    const sessionHeader = await storeUserInSession({
      email: responseData.data.email as string,
      id: responseData.data.id as string,
    });

    return redirect("/drive", {
      headers: {
        "Set-Cookie": sessionHeader,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const OTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const fetcher = useFetcher<{ success: boolean; message: string }>(); // Remix async form handler
  const [toastId, setToastId] = useState<string | null>(null); // Store toast ID

  const handleSubmit = async (submittedOTP: string) => {
    if (otp.length !== 6) return toast.error("OTP is not complete");

    const formData = new FormData();
    formData.append("otp", submittedOTP);

    // Show loading toast and store its ID
    const id = toast.loading("Verifying OTP...");
    setToastId(id);

    // Submit the form asynchronously
    fetcher.submit(formData, { method: "post" });
  };

  // Track fetcher state and update toast dynamically
  useEffect(() => {
    if (fetcher.state === "submitting" && toastId) {
      toast.loading("Verifying OTP...", { id: toastId }); // Keep loading
    }

    if (fetcher.state === "idle" && fetcher.data && toastId) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message || "OTP Verified!", { id: toastId });
      } else {
        toast.error(fetcher.data.message || "OTP Verification Failed.", {
          id: toastId,
        });
      }
      setToastId(null); // Reset toast ID after handling response
    }
  }, [fetcher.state, fetcher.data, toastId]);

  return (
    <div>
      <label htmlFor="One-Time">One-Time Password</label>

      <Form method="post">
        <InputOTP
          value={otp.join("")}
          onChange={(value) => setOtp(value.split(""))}
          autoComplete="on"
          maxLength={6}
          onComplete={() => otp.length === 6 && handleSubmit(otp.join(""))}
        >
          <InputOTPGroup className="gap-2" aria-label="One-Time Password">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="border-2 border-[#4A56E2] w-14 h-14 text-xl text-center p-3 rounded-md"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </Form>

      <p className="text-[#656672]">
        Please enter the one-time password sent to your Email.
      </p>
      <p className="mt-4 text-[#909090]">
        <Link
          to={"/login"}
          className="text-[#4A56E2] font-semibold"
          type="button"
        >
          {" "}
          Resend OTP
        </Link>{" "}
        || If you dont find OTP mail
      </p>
    </div>
  );
};

export default OTP;
