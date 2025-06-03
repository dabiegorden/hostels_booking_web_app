"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import Paystack Popup
import PaystackPop from "@paystack/inline-js";

export default function PaymentForm({
  hostelName,
  roomName,
  roomPrice,
  duration,
  onPaymentSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentType, setPaymentType] = useState("partial");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    mobileNetwork: "mtn",
    mobileNumber: "",
  });
  const { toast } = useToast();

  const totalAmount = roomPrice;
  const paymentAmount =
    paymentType === "partial" ? totalAmount / 2 : totalAmount;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const initializePaystackPayment = async () => {
    try {
      setLoading(true);

      const paymentData = {
        hostelId: "sample-hostel-id",
        roomId: "sample-room-id",
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        duration,
        totalAmount,
        paymentAmount,
        paymentType:
          paymentType === "partial" ? "Partial Payment" : "Full Payment",
        email: formData.email,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
      };

      // Call the Express backend directly
      const response = await fetch(
        "http://localhost:5000/api/bookings/initialize-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to initialize payment");
      }

      // Use Paystack Popup to complete the transaction
      if (result.access_code) {
        const popup = new PaystackPop();

        popup.resumeTransaction(result.access_code, {
          onSuccess: (transaction) => {
            console.log("Payment successful:", transaction);
            // Redirect to the correct success page
            window.location.href = `/bookings/success?reference=${transaction.reference}&booking_id=${result.bookingId}`;
          },
          onCancel: () => {
            console.log("Payment cancelled");
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
            setLoading(false);
          },
          onError: (error) => {
            console.error("Payment error:", error);
            toast({
              title: "Payment Error",
              description: "An error occurred during payment",
              variant: "destructive",
            });
            setLoading(false);
          },
        });
      } else {
        // Redirect to Paystack checkout if no access_code
        window.location.href = result.authorization_url;
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleMobilePayment = async () => {
    try {
      setLoading(true);

      const paymentData = {
        hostelId: "sample-hostel-id",
        roomId: "sample-room-id",
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        duration,
        totalAmount,
        paymentAmount,
        paymentType:
          paymentType === "partial" ? "Partial Payment" : "Full Payment",
        email: formData.email,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        mobilePayment: {
          network: formData.mobileNetwork,
          phoneNumber: formData.mobileNumber,
        },
      };

      // Call the Express backend directly
      const response = await fetch(
        "http://localhost:5000/api/bookings/mobile-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to initialize mobile payment"
        );
      }

      toast({
        title: "Mobile Payment",
        description:
          "Please follow the prompts on your phone to complete the payment",
      });

      // Check payment status after a delay
      setTimeout(async () => {
        try {
          const verifyResponse = await fetch(
            `http://localhost:5000/api/payments/verify/${result.reference}`
          );
          const verifyResult = await verifyResponse.json();

          if (verifyResult.success && verifyResult.data.status === "success") {
            toast({
              title: "Payment Successful",
              description:
                "Your mobile money payment has been processed successfully",
            });
            onPaymentSuccess?.({
              method: "mobile_money",
              network: formData.mobileNetwork,
              amount: paymentAmount,
              reference: result.reference,
            });
          } else {
            toast({
              title: "Payment Pending",
              description: "Please complete the payment on your mobile device",
            });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
        } finally {
          setLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error("Mobile payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process mobile money payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card") {
      initializePaystackPayment();
    } else {
      handleMobilePayment();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
        <CardDescription>
          {hostelName} - {roomName} ({duration})
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Type</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial">
                  Partial Payment - GH₵ {(totalAmount / 2).toFixed(2)} (50% now,
                  50% later)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">
                  Full Payment - GH₵ {totalAmount.toFixed(2)}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Card Payment (Visa, Mastercard)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Money</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Customer Information
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {paymentMethod === "mobile" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobileNetwork">Mobile Network</Label>
                  <Select
                    value={formData.mobileNetwork}
                    onValueChange={(value) =>
                      handleInputChange("mobileNetwork", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                      <SelectItem value="airteltigo">
                        AirtelTigo Money
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Money Number</Label>
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      handleInputChange("mobileNumber", e.target.value)
                    }
                    placeholder="Enter your mobile money number"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="specialRequests">
                Special Requests (Optional)
              </Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) =>
                  handleInputChange("specialRequests", e.target.value)
                }
                placeholder="Any special requests or requirements"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Room Price:</span>
              <span>GH₵ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Type:</span>
              <span>
                {paymentType === "partial" ? "Partial Payment" : "Full Payment"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Amount to Pay:</span>
              <span>GH₵ {paymentAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay GH₵ ${paymentAmount.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
