import { Suspense } from "react";
import WebsiteTabClient from "./WebsiteTabClient";
import { prisma } from "@/server/db/client";

async function getHomepageImages() {
  const images = await prisma.homepageImage.findMany({
    orderBy: { order: 'asc' },
  });
  return images;
}

export default async function WebsiteTab() {
  const images = await getHomepageImages();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebsiteTabClient initialImages={images} />
    </Suspense>
  );
}