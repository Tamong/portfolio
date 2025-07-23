import { CustomMDX } from "./mdx";

export default function MdxPreview({ source }: { source: string }) {
  return <CustomMDX source={source} />;
}
