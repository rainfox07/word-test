"use client";

import { Button } from "@/components/ui/button";

export function ContactPlaceholderButton() {
  return (
    <Button
      onClick={() => {
        window.alert("添加我的微信: _3kuxD");
      }}
    >
      提交反馈
    </Button>
  );
}
