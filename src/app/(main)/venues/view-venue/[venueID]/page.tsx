import { PageHeader } from "../../../../../components/pageheader/PageHeader";
import React from "react";
import ViewVenueComp from "../_viewVenueComp/ViewVenueComp";
// interface ViewVenueProp {
//   params: {
//     venueID: string;
//   };
// }
export default async function ViewVenue() {
  // { params }: ViewVenueProp
  // const { venueID = "" } = await params;
  console.log("from here");
  return (
    <>

        <ViewVenueComp />
      
    </>
  );
}
