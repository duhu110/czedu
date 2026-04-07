"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validations/application";
import { createApplication } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ApplicationForm({ semesterId }: { semesterId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 2. 显式传入泛型
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      semesterId: semesterId,
      residencyType: "LOCAL" as ApplicationInput["residencyType"],
      gender: "MALE" as ApplicationInput["gender"],
      name: "",
      idCard: "",
      studentId: "",
      guardian1Name: "",
      guardian1Phone: "",
      guardian2Name: "",
      guardian2Phone: "",
      currentSchool: "",
      currentGrade: "",
      targetGrade: "",
      hukouAddress: "",
      livingAddress: "",
      fileHukou: [],
      fileProperty: [],
      fileStudentCard: [],
      fileResidencePermit: [],
    },
  });

  // 3. 使用 useWatch 替换 form.watch() 解决编译警告
  const residencyType = useWatch({
    control: form.control,
    name: "residencyType",
  });

  // 4. 显式定义 SubmitHandler 解决类型不兼容问题
  async function onSubmit(values: ApplicationInput) {
    setIsSubmitting(true);
    const res = await createApplication(values);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("转学申请提交成功！");
      router.push("/application/new/success");
    } else {
      toast.error(res.error || "提交失败，请重试");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. 学生基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="residencyType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    户籍类型 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="LOCAL" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          城中区户籍
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NON_LOCAL" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          非城中区户籍
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="学生姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别 *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-2 h-9 items-center"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="MALE" />
                          </FormControl>
                          <FormLabel className="font-normal">男</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="FEMALE" />
                          </FormControl>
                          <FormLabel className="font-normal">女</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="idCard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>身份证号码 *</FormLabel>
                  <FormControl>
                    <Input placeholder="18位身份证号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>全国学籍号码 *</FormLabel>
                  <FormControl>
                    <Input placeholder="如：G123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 第二部分：联系人信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. 监护人信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guardian1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>监护人1 姓名 *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardian1Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码 *</FormLabel>
                    <FormControl>
                      <Input type="tel" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* 监护人 2 选填 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guardian2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>监护人2 (选填)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardian2Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码 (选填)</FormLabel>
                    <FormControl>
                      <Input type="tel" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 第三部分：学籍与地址 (为了省版面，代码省略了类似的 FormField，直接放 Input) */}
        {/* 第三部分：学籍与地址 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">3. 学校与地址</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 学校相关 */}
            <FormField
              control={form.control}
              name="currentSchool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前就读学校 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入完整的学校名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>当前就读年级 *</FormLabel>
                    <FormControl>
                      <Input placeholder="如：二年级" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>申请转入年级 *</FormLabel>
                    <FormControl>
                      <Input placeholder="如：三年级" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 分割线（可选，增加视觉层次） */}
            <div className="h-px bg-muted my-4" />

            {/* 地址相关 */}
            <FormField
              control={form.control}
              name="hukouAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>户籍详细地址 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入户口本首页上的详细地址"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="livingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>现居住详细地址 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入目前实际居住的详细地址（需与房产证/租赁合同一致）"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 第四部分：资料上传 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">4. 申请资料上传</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-xs text-muted-foreground mb-4">
              请上传清晰的原件照片。单张图片不超过 5MB。
            </div>

            {/* 占位符：下节课我们就来写这个 ImageUploader */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">
                  1. 户口本（首页及学生页）*
                </p>
                <FormField
                  control={form.control}
                  name="fileHukou"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {/* 将表单的值和 onChange 事件交给上传组件 */}
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          maxCount={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">
                  2. 房产证或房屋租赁备案证明 *
                </p>
                <FormField
                  control={form.control}
                  name="fileProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          maxCount={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">3. 学生学籍信息卡 *</p>
                <FormField
                  control={form.control}
                  name="fileStudentCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          maxCount={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 联动：非户籍必须显示居住证 */}
              {residencyType === "NON_LOCAL" && (
                <div className="border border-primary/50 rounded-lg p-4 bg-primary/5 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
                  <p className="text-sm font-medium text-primary mb-2">
                    4. 监护人或学生居住证 *
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    非城中区户籍人口必传
                  </p>
                  <FormField
                    control={form.control}
                    name="fileResidencePermit"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* 居住证是 optional 的，为了防止 undefined 报错，默认给个空数组 */}
                          <ImageUploader
                            value={field.value || []}
                            onChange={field.onChange}
                            maxCount={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮：吸底设计 */}
        <div className="sticky bottom-0 left-0 w-full p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-8">
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                正在提交数据...
              </>
            ) : (
              "确认并提交申请"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
