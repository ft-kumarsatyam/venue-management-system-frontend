import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import Image from "next/image";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import ActionsComp from "../../components/ui/actionbutton";
import { ReactNode } from "react";

type ActionItem = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  onClick?: (id: string) => void;
  navigateTo?: string;
};

interface TableProps {
  columns: {
    key: string;
    label: string;
    render?: (row: any, index?: number) => ReactNode;
  }[];
  data: any[];
  actions?: ActionItem[];
  isOpen?: boolean;
  keyField?: string;
  loading?: boolean;
}

export const GenericTable = ({
  columns,
  data,
  actions,
  loading,
  keyField = "id",
}: TableProps) => {
  console.log(data);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm overflow-hidden border-gray-200">
      <Table className="border border-gray-200">
        <TableHeader>
          <TableRow className="border-[var(--background)] border-gray-200">
            {columns.map((col) => (
              <TableHead key={col.key} className="px-4 py-4 text-md text-left">
                {col.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="px-4 py-4 text-md text-center">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row[keyField] || rowIndex} className="border-none">
              {columns.map((col) => {
                let value = col.render
                  ? col.render(row, rowIndex)
                  : row[col.key];

                if (
                  !col.render &&
                  typeof value === "object" &&
                  value !== null
                ) {
                  if (col.key === "coordinates") {
                    const { lat, lng } = value;
                    value = `Lat: ${lat ?? "-"}, Lng: ${lng ?? "-"}`;
                  } else if (col.key === "venue") {
                    value = value?.venue_name || "—";
                  } else if (
                    col.key === "facility_amenities" &&
                    Array.isArray(value)
                  ) {
                    value = value.map((v) => v?.name || v).join(", ");
                  } else {
                    value = JSON.stringify(value);
                  }
                }

                // ✅ Updated to handle venue names and images
                if (
                  col.key === "venue_name" ||
                  col.key === "zone_name" ||
                  col.key === "facility_name" ||
                  col.key === "name"
                ) {
                  return (
                    <TableCell key={col.key} className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() =>
                            window.open(
                              row?.venue_image_url ||
                                row?.facility_image_url ||
                                row?.image_url ||
                                "https://www.pngmart.com/files/21/Admin-Profile-Vector-PNG-Image.png",
                              "_blank"
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Image
                            src={
                              row?.venue_image_url ||
                              row?.facility_image_url ||
                              row?.image_url ||
                              "https://www.pngmart.com/files/21/Admin-Profile-Vector-PNG-Image.png"
                            }
                            alt={value || "Image"}
                            height={40}
                            width={40}
                            className="rounded-[50%] object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://www.pngmart.com/files/21/Admin-Profile-Vector-PNG-Image.png";
                            }}
                          />
                        </div>
                        <div className="text-[var(--black)]">{value}</div>
                      </div>
                    </TableCell>
                  );
                } else if (col.key === "coordinates" || col.key === "venue") {
                  return (
                    <TableCell
                      key={col.key}
                      className="px-4 py-4 text-purple-600 underline decoration-solid"
                    >
                      {value}
                    </TableCell>
                  );
                } else {
                  return (
                    <TableCell
                      key={col.key}
                      className="px-4 py-4 text-[var(--black)]"
                    >
                      {value}
                    </TableCell>
                  );
                }
              })}
              {actions && (
                <TableCell className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {actions.map((action, index) => (
                      <ActionsComp
                        key={index}
                        icon={action.icon}
                        title={action.title}
                        navigate={action.navigateTo}
                        id={row[keyField]}
                        onClick={
                          action.onClick
                            ? () => action.onClick!(row[keyField])
                            : () => console.log("Action clicked")
                        }
                      />
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GenericTable;
