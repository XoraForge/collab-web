import SectionInformation from "../section/SectionInformation";
import Toggleable from "./Toggleable";

export default function SecondaryHeader() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-1">
        <Toggleable />
      </div>
      <SectionInformation />
    </div>
  );
}
