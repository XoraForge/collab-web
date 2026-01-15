import { Dispatch, SetStateAction } from "react";
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
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  setItems?: Dispatch<SetStateAction<string>>;
  date?: Date;
  setDate?: Dispatch<SetStateAction<Date>>;
}

export default function Fieldset({
  label,
  type,
  selectItems,
  value,
  setValue,
  setItems,
  date,
  setDate,
}: FieldsetProps) {
  return (
    <div className="flex flex-col gap-y-1.5 w-full">
      <p className="text-xs font-medium">{label}</p>
      {type == "input" && (
        <Input
          value={value}
          onChange={(e) => setValue && setValue(e.target.value)}
        />
      )}
      {type == "dropdown" && (
        <Select onChange={(e) => setItems && setItems(e)}>
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
      {type == "datepicker" && <DatePicker date={date} setDate={setDate} />}
    </div>
  );
}
