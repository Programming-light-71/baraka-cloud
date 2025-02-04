import { db } from "../db.server";
import { generateOTP } from "../OTPGenarator";

interface UserCreationArgs {
  email: string;
}
export async function AuthManager({ email }: UserCreationArgs) {
  try {
    const existingUser = await db?.user.findUnique({ where: { email } });

    const otp = await generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (existingUser) {
      const userID = existingUser.id;
      await db?.otpVerification.create({
        data: {
          otp: otp.toString(),
          userId: userID,
          email,
          expiresAt, // 5 minutes from now
        },
      });

      // Send OTP to user
      return {
        success: true,
        message: "OTP Sent to User",
        data: {
          ...existingUser,
          otp,
          expiresAt,
        },
      };
    } else {
      const newUser = await db?.user.create({
        data: {
          email,
          membershipStatus: "FREE",
        },
      });

      if (newUser) {
        await db?.otpVerification.create({
          data: {
            otp: otp.toString(),
            email,
            userId: newUser.id,
            expiresAt, // 5 minutes from now
          },
        });
      }

      return {
        success: true,
        message: "OTP Sent to User",
        data: {
          ...newUser,
          otp,
          email,
          expiresAt,
        },
      };
    }
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to Manage Auth", details: error },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}

export async function OTPManager({
  otp,
  email,
  userId,
}: {
  otp: string;
  email: string;
  userId: string;
}) {
  try {
    // console.log("OTP Manager", otp, email, userId);

    const OtpExists = await db?.otpVerification.findFirst({
      where: {
        OR: [
          {
            otp,
            userId,
          },
          {
            otp,
            email,
          },
        ],
      },
    });

    // console.log("OtpExists", OtpExists);

    if (OtpExists) {
      const isMatchedOTP = OtpExists.otp === otp;
      const isExpired =
        new Date().getTime() > new Date(OtpExists?.expiresAt).getTime();
      const existUser = await db?.user.findUnique({
        where: {
          email,
        },
      });

      if (isMatchedOTP && !isExpired) {
        if (!(existUser?.emailVerified as boolean)) {
          await db?.user.update({
            where: {
              id: userId,
            },
            data: {
              emailVerified: true,
            },
          });
        }

        await db?.otpVerification.deleteMany({
          where: {
            OR: [
              {
                userId,
              },
              {
                email,
              },
            ],
          },
        });

        // Set the cookie with the token

        return { success: true, data: { ...existUser } };
      }
    } else {
      return Response.json(
        {
          success: false,
          error: "Invalid or expired OTP",
        },
        {
          status: 400,
          statusText: "Bad Request | Invalid or expired OTP",
        }
      );
    }
  } catch (error) {
    console.error("internal server error", error);
    return Response.json(
      { success: false, error: "Failed to Manage Auth", details: error },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}
