import ProjectTab from "@/components/common/ProjectTab";
import Activity from "@/components/dashboard/project/Activity";
import DetailTitle from "@/components/dashboard/project/DetailTitle";
import Tabs from "@/components/dashboard/project/Tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpenText } from "lucide-react";
import Image from "next/image";

export default async function page({ params }) {
  const { id } = await params;

  return (
    <div className="flex flex-col size-full ">
      {/* Banner */}
      <div className="w-full bg-[#242424] border-b border-[#313131] flex justify-center">
        {/* Image -> Name -> Team Members -> Invite / Edit */}
        <div className="w-[80%] py-6 flex flex-col gap-y-8">
          <div className="flex justify-between items-center text-white">
            {/* Image and Name */}
            <div className="flex gap-x-6 ">
              <div className="size-32 relative border border-white flex items-center justify-center rounded-md">
                <BookOpenText size={50} />
              </div>
              <div className="flex flex-col justify-center gap-y-1.5">
                <p className="text-sm font-medium">Public Project</p>
                <h1 className="text-4xl font-bold">
                  {id.replaceAll("-", " ").toUpperCase()}
                </h1>
                <div className="flex items-center">
                  <p className="text-sm font-regular">Created By: </p>
                  <div className="size-6 relative overflow-hidden ml-2.5">
                    <Image
                      src="/testimage.png"
                      fill
                      className="object-cover"
                      alt="user"
                    />
                  </div>
                  <p className="text-sm font-medium ml-1.5">Alex Hunter</p>
                </div>
              </div>
            </div>
            {/* Team Members and Actions */}
            <div className="flex gap-x-3 items-center">
              {/* Team members */}
              <div className="flex self-end pb-2"></div>
              <div className="flex flex-col gap-y-2">
                <div className="text-right">
                  <p className="font-medium text-xs">Last Update: 2 hour ago</p>
                </div>
                {/* Actions (Share | Invite | Edit) */}
                <div className="flex gap-x-3">
                  <Button variant="outline">Share</Button>
                  <Button variant="outline">Invite</Button>
                  <Button>Edit</Button>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <Tabs />
        </div>
      </div>

      {/* Screens */}
      <div
        className="bg-[#181818] flex justify-center"
        style={{ height: "calc(802px - 148px)" }}
      >
        {/* For overview, it will be overview | activity */}
        <div className="w-[80%] flex gap-x-6 mt-5">
          <div className="flex flex-col w-[70%] overflow-y-auto no-scrollbar gap-y-3">
            <h3 className="text-lg">Overview</h3>
            <hr />
            <div className="flex flex-col px-2 gap-y-6">
              <h2>
                Project Title: Business Analytics for Retail Market Optimization
                (ICT374)
              </h2>

              <p>
                <strong>Project Description:</strong>
              </p>
              <p>
                The{" "}
                <strong>
                  Business Analytics for Retail Market Optimization
                </strong>{" "}
                project aims to analyze and optimize retail business performance
                using data-driven techniques in the field of business analytics.
                As part of the <strong>ICT374 Business Analytics</strong>{" "}
                course, this project is focused on applying analytical tools and
                methodologies to understand consumer behavior, optimize
                inventory management, and improve sales strategies for retail
                businesses.
              </p>

              <p>
                Our project uses <strong>real-world retail data</strong> to
                uncover insights about customer preferences, buying patterns,
                and product demand. The goal is to develop a set of
                recommendations for a fictional retail company, <em>RetailX</em>
                , to enhance their marketing strategies, product offerings, and
                overall business performance.
              </p>

              <h3>
                <strong>Key Components:</strong>
              </h3>
              <ul className="flex flex-col gap-y-1 ml-3 list-decimal">
                <li>
                  <strong>Data Collection & Analysis</strong>: We have gathered
                  a dataset containing sales data, customer demographics, and
                  product categories to perform exploratory data analysis (EDA).
                  This includes identifying trends, seasonality, and patterns in
                  customer purchases.
                </li>
                <li>
                  <strong>Predictive Modeling</strong>: Using machine learning
                  algorithms, such as linear regression and decision trees, we
                  developed predictive models to forecast product demand and
                  identify key drivers of sales performance.
                </li>
                <li>
                  <strong>Optimization</strong>: We applied optimization
                  techniques to suggest an inventory management model that
                  minimizes stockouts while reducing excess inventory, ensuring
                  the company can meet customer demand without overstocking.
                </li>
                <li>
                  <strong>Visualization</strong>: To present our findings
                  clearly, we have created interactive dashboards and
                  visualizations using Power BI and Excel. These visualizations
                  illustrate key metrics, trends, and the impact of the
                  recommended strategies on business outcomes.
                </li>
                <li>
                  <strong>Report & Presentation</strong>: The final deliverables
                  include a comprehensive report detailing the analysis,
                  methodologies, and recommendations, along with a{" "}
                  <strong>PowerPoint presentation</strong> for a final project
                  showcase. The presentation is designed to summarize the
                  project’s key findings and demonstrate the impact of the
                  proposed business strategies.
                </li>
              </ul>

              <h3>
                <strong>Team Members:</strong>
              </h3>
              <ul>
                <li>
                  <strong>Alex Hunter</strong> (Team Lead): Oversees project
                  coordination and ensures deadlines are met. Focuses on data
                  collection and predictive modeling.
                </li>
                <li>
                  <strong>Jordan Smith</strong>: Specializes in data cleaning,
                  analysis, and visualization. Works on creating interactive
                  dashboards.
                </li>
                <li>
                  <strong>Taylor Lee</strong>: Handles research on business
                  optimization techniques and integrates the predictive models
                  with real-world business cases.
                </li>
                <li>
                  <strong>Chris Williams</strong>: Focuses on writing the final
                  report and presentation, ensuring all information is clearly
                  communicated.
                </li>
              </ul>

              <h3>Technologies Used:</h3>
              <ul>
                <li>
                  <strong>PowerPoint</strong>: For the project presentation.
                </li>
                <li>
                  <strong>Microsoft Word</strong>: For the detailed project
                  report.
                </li>
                <li>
                  <strong>Power BI/Excel</strong>: For data visualization and
                  creating interactive dashboards.
                </li>
                <li>
                  <strong>Python/R</strong>: For data analysis and machine
                  learning algorithms.
                </li>
              </ul>

              <h3>Objectives:</h3>
              <ul>
                <li>
                  Provide actionable insights for retail companies using
                  business analytics techniques.
                </li>
                <li>
                  Build predictive models to forecast future product demands and
                  customer behavior.
                </li>
                <li>
                  Create visualizations that help business stakeholders
                  understand the data and make informed decisions.
                </li>
              </ul>

              <h3>Outcome:</h3>
              <p>
                The project provides <strong>RetailX</strong> with actionable
                recommendations for improving sales and inventory management
                strategies, backed by data-driven insights. The final
                deliverables, including the report and PowerPoint presentation,
                will be presented to the course instructor as part of the final
                assessment.
              </p>
            </div>
          </div>
          <div className="w-[30%] h-fit flex flex-col gap-y-3">
            <div className="border border-[#494949] rounded-md flex flex-col gap-y-2 px-3 py-2">
              <h1 className="text-lg font-medium">Project Details</h1>
              <div className="flex flex-col gap-y-2">
                <div className="flex justify-between">
                  <DetailTitle icon="mingcute:time-line" title="Created At" />
                  <p>12 September 2025, 10:31PM</p>
                </div>
                <div className="flex justify-between">
                  <DetailTitle icon="lets-icons:progress" title="Status" />
                  <Badge variant="destructive">In Progress</Badge>
                </div>
                <div className="flex justify-between">
                  <DetailTitle icon="stash:calendar-end" title="Due By" />
                  <p>19 December 2025 (9 days left)</p>
                </div>
                <div className="flex justify-between">
                  <DetailTitle icon="mdi:users" title="Contributors" />
                  <div className="flex">
                    <div className="size-6 relative overflow-hidden">
                      <Image
                        src="/testimage.png"
                        fill
                        className="object-cover"
                        alt="user"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <DetailTitle
                    icon="material-symbols:folder"
                    title="Project Size"
                  />
                  <p>1.2MB</p>
                </div>
                <div className="flex justify-between">
                  <DetailTitle
                    icon="material-symbols:download"
                    title="Downloads"
                  />
                  <p>0</p>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="border border-[#494949] rounded-md flex flex-col gap-y-2 px-3 py-2">
              <h1 className="text-lg font-medium">Recent Activities</h1>
              <div className="flex flex-col gap-y-6 mt-3">
                <Activity date="Today" time="10:31PM">
                  <div className="flex gap-x-2 items-center">
                    <div className="size-5 relative overflow-hidden">
                      <Image
                        src="/testimage.png"
                        fill
                        className="object-cover"
                        alt="user"
                      />
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">
                      Alex Hunter{" "}
                      <span className="font-normal">
                        has invited <b>3 others</b> as <b>Editor</b>
                      </span>
                    </p>
                  </div>
                </Activity>
                <Activity date="12 September" time="10:31PM">
                  <div className="flex gap-x-2 items-center">
                    <div className="size-5 relative overflow-hidden">
                      <Image
                        src="/testimage.png"
                        fill
                        className="object-cover"
                        alt="user"
                      />
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">
                      Alex Hunter
                      <span className="font-normal">
                        has <b>initialized</b> the project
                      </span>
                    </p>
                  </div>
                </Activity>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
