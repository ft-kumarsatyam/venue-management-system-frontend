// interface StepperCompProp {
//   steps: string[];
//   currentStep: number;
// }

// const Stepper = ({ currentStep, steps }: StepperCompProp) => {
//   return (
//     <ol className="flex items-center w-full">
//       {steps.map((step, index) => (
//         <li key={index} className="flex items-center w-full">
//           <div
//             className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
//               index < currentStep
//                 ? "text-white"
//                 : "text-gray-400 border-gray-300"
//             }`}
//             style={{
//               background:
//                 index < currentStep ? "var(--purple-dark)" : "#7942D11F",
//               color: index < currentStep ? "white" : "var(--purple-dark)",
//             }}
//           >
//             {index + 1}
//           </div>

//           <div className="flex-grow h-0.5 border-dashed border-t border-gray-300 mx-2"></div>
//         </li>
//       ))}
//     </ol>
//   );
// };

// export default Stepper;
interface StepperCompProp {
  steps: string[];
  currentStep: number; // 0-based index
}

const Stepper = ({ currentStep, steps }: StepperCompProp) => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="flex w-full max-w-6xl items-center relative">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep - 1;
          const isCurrent = index === currentStep - 1;
          const isUpcoming = index > currentStep - 1;

          return (
            <div key={index} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 z-0">
                  <div
                    className="w-full border-t-2 border-dashed border-purple-300"
                    style={{
                      borderColor: "#5B1166",
                    }}
                  ></div>
                </div>
              )}

              <div
                className="w-10 h-10 flex items-center justify-center rounded-full border-2  z-10 font-semibold"
                style={{
                  background: isCompleted || isCurrent
                    ? "var(--purple-dark)"
                    : "#F3E8FF",
                  borderColor:isUpcoming
                  ? "#5B1166"
                  : "",
                  color: isCompleted || isCurrent
                    ? "white"
                    : "#5B1166",
                }}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              {/* Step Label */}
              {/* index < currentStep ? "✓" :  */}
              <span
                className={`text-sm mt-2 ${isCurrent
                  ? "text-[var(--purple-dark-1)] font-semibold"
                  : "text-gray-400"
                  }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
