import { DatePicker } from "../ui/datepicker";
import { Input } from "../ui/input";
import { Select, SelectItem } from "./Dropdown";

export interface SelectItemProps {
  title: string;
  icon: string;
}

interface FieldsetProps {
  label: string;
  type: "input" | "dropdown" | "datepicker";
  selectItems?: SelectItemProps[];
}

export default function Fieldset({ label, type, selectItems }: FieldsetProps) {
  return (
    <div className="flex flex-col gap-y-1.5 w-full">
      <p className="text-xs font-medium">{label}</p>
      {type == "input" && <Input />}
      {type == "dropdown" && (
        <Select>
          {selectItems &&
            selectItems.length > 0 &&
            selectItems.map((data) => (
              <SelectItem
                title={data.title}
                icon={data.icon}
                key={data.title}
              />
            ))}
        </Select>
      )}
      {type == "datepicker" && <DatePicker />}
    </div>
  );
}
