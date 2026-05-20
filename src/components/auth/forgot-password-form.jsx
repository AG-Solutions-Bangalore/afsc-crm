import { motion } from "framer-motion";
import { Mail, User, Send, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { LOGIN } from "@/constants/apiConstants";
import { useSelector } from "react-redux";
import { getImageBaseUrl } from "@/utils/imageUtils";

export default function ForgotPasswordForm({ onBackToLogin }) {
  const companyDetails = useSelector((state) => state.company.companyDetails);
  const companyImage = useSelector((state) => state.company.companyImage);

  const logoBaseUrl = getImageBaseUrl(companyImage, "Company");
  const logoUrl =
    logoBaseUrl && companyDetails?.company_logo
      ? `${logoBaseUrl}${companyDetails.company_logo}`
      : null;

  const [form, setForm] = useState({
    username: "",
    email: "",
  });
  const { trigger: forgotPassword, loading: isLoading } = useApiMutation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await forgotPassword({
        url: LOGIN.forgotpassword,
        method: "POST",
        data: form,
      });

      if (res?.code === 201) {
        toast.success(res.message || "Reset link sent successfully");
        setForm({ username: "", email: "" });
        onBackToLogin();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="h-full lg:col-span-2 p-6 md:p-10 flex flex-col justify-center bg-white to-transparent"
    >
      <div className="flex items-center rounded-md mb-4 md:mb-6">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-16 md:h-20 w-auto" />
        ) : (
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
            AFSC
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-1">
          Forgot Password?
        </h1>
        <p className="text-dark/20 text-md mb-6 md:mb-8">
          We'll send a password to your registered email.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 md:space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-dark mb-2">
              Mobile No
            </label>
            <div className="relative group">
              <motion.input
                type="tel"
                name="username"
                placeholder="Enter your mobile no."
                value={form.username}
                minLength={10}
                maxLength={10}
                onChange={handleChange}
                className="no-spinner w-full px-4 py-2.5 pl-11 rounded-xl bg-white/10 border border-dark text-dark placeholder-dark/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors"
                size={18}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-dark mb-2">
              Email Id
            </label>
            <div className="relative group">
              <motion.input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pl-11 rounded-xl bg-white/10 border border-dark text-dark placeholder-dark/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors"
                size={18}
              />
            </div>
          </motion.div>

          <div className="pt-2">
            <Button className="w-full py-3" type="submit" disabled={isLoading}>
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Send reset link
                </>
              )}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center text-sm text-primary/80 hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
