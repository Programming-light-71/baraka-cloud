/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  console.log(form);
  return request.method === "post"
    ? new Response(null, {
        status: 303,
        headers: {
          Location: "/",
        },
      })
    : {};
}

const OTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); // Store OTP digits
  const submit = useSubmit(); // Remix form submission

  // const isOtpComplete = otp.length === 6;

  const handleSubmit = useCallback(() => {
    const form = new FormData();

    console.log("otp", otp.join(""));
    form.append("otp", otp.join(""));
    submit(form, { method: "post" });
  }, []);

  // Update OTP state

  return (
    <div>
      <label htmlFor="One-Time">One-Time Password</label>
      <Form method="post">
        <InputOTP
          value={otp.join("")}
          onChange={(value) => setOtp(value.split(""))}
          autoComplete="on"
          maxLength={6}
          onComplete={() => otp.length === 6 && handleSubmit()}
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
        Please enter the one-time password sent to your phone.
      </p>
    </div>
  );
};

export default OTP;
