import { Input } from "../ui/input";

interface FormFieldProps {
  label: string;
  placeholder: string;
  type?: string;
}

const FormField = ({ label, placeholder, type = "text" }: FormFieldProps) => (
  <div className="flex flex-col mb-4">
    <label className={`text-sm font-medium ${label === "" && placeholder === "Latitude" ? "mb-6" : "mb-1"}`}>{label}</label>
    <Input
      type={type}
      placeholder={placeholder}
      className={`rounded-md border-[var(--background)] placeholder-[var(--foreground)] ${label === "Upload Image" && placeholder === "" ? "p-1 pl-[3%] text-[#3f3f46b2]" : "p-3"}`}
    />
  </div>
);
export default FormField