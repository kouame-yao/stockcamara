import { ChartLineMultiple } from "@/components/chart-line-multiple";
import { ChartPieLegend } from "@/components/chart-pie-legend";
import { TableDemo } from "@/components/table";
import TimeLine from "@/components/time-line";
import { Card } from "@/components/ui/card";
import Wrapper from "@/layouts/wrapper";
import CardUpdate from "@/propre-elements/components/card-update";
import { SectionCards } from "@/propre-elements/components/sections-card";

export default function page() {
  return (
    <Wrapper>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <section className="lg:col-span-8 w-full grid gap-4">
          <SectionCards />
          <ChartLineMultiple />
          <Card className="p-4">
            <TableDemo mod="preview" />
          </Card>
          <Card className="p-4">
            <TableDemo mod="TopPreview" />
          </Card>
        </section>
        <section className="lg:col-span-4 w-full grid gap-4">
          <TimeLine />
          <ChartPieLegend />
          <CardUpdate />
        </section>
      </main>
    </Wrapper>
  );
}
