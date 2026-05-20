import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFILE } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { trigger, loading: loading } = useApiMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const {
    data: profileData,
    isLoading: profileLoading,
    refetch,
  } = useGetApiMutation({
    url: PROFILE.profile,
    queryKey: ["profile"],
  });
  useEffect(() => {
    if (profileData) {
      setFormData(profileData?.profile);
    }
  }, [profileData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.mobile) {
      toast.error("Email and Mobile are required");
      return;
    }

    try {
      const res = await trigger({
        url: PROFILE.updateprofile,
        method: "PUT",
        data: formData,
      });
      if (res?.code === 200) {
        toast.success(res.message || "Profile updated");
        // setOpen(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full">
      <div className="w-full" aria-describedby={undefined}>
        <div className="">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Profile
          </h2>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={formData.name} disabled />
            </div>

            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Mobile</Label>
              <Input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 digit mobile"
              />
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            className=""
            onClick={handleSubmit}
            disabled={loading || profileLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
