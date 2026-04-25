"use client";

import { Button } from "@/components/ui/button";

export function ContactPlaceholderButton() {
  return (
    <Button
      onClick={() => {
        window.alert("联系方式后续补充");
      }}
    >
      联系方式后续补充
    </Button>
  );
}
