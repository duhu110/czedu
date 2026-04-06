import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/lazy-image";
import { FullWidthDivider } from "@/components/ui/full-width-divider";

type BlogType = {
  title: string;
  href: string;
  description: string;
  author: string;
  createdAt: string;
  readTime: string;
  image: string;
};

const blogs: BlogType[] = [
  {
    title: "2026 秋季申请趋势",
    href: "#",
    description:
      "基于 mock 数据整理本季热门转学方向，帮助学生判断计算机、数据科学和商科的竞争热度变化。",
    image: "https://storage.efferd.com/creative/beams.webp",
    createdAt: "2026-04-03",
    author: "申请策略组",
    readTime: "4 分钟阅读",
  },
  {
    title: "低年级转学如何补课程描述",
    href: "#",
    description:
      "把 syllabus、作业比例、实验学时整理成院校更容易审核的结构，减少转学分评估来回补件。",
    image: "https://storage.efferd.com/creative/plasma.webp",
    createdAt: "2026-03-28",
    author: "材料审核组",
    readTime: "5 分钟阅读",
  },
  {
    title: "跨专业转学文书怎么讲",
    href: "#",
    description:
      "重点不是简单说“我喜欢这个专业”，而是解释课程经历、能力迁移和未来规划如何连成一条线。",
    image: "https://storage.efferd.com/creative/ripple-grid.webp",
    createdAt: "2026-03-22",
    author: "文书顾问组",
    readTime: "6 分钟阅读",
  },
  {
    title: "推荐信迟迟未回怎么办",
    href: "#",
    description:
      "建立催办时间点、备用老师名单和提交顺序，让申请节奏不被单个材料拖住。",
    image: "https://storage.efferd.com/creative/silk.webp",
    createdAt: "2026-03-18",
    author: "流程运营组",
    readTime: "3 分钟阅读",
  },
  {
    title: "社区大学转 UC 的规划样例",
    href: "#",
    description:
      "用一份 mock 案例展示从先修课安排、TAG 策略到 portal 提交前的完整时间线。",
    image: "https://storage.efferd.com/creative/dark-veil.webp",
    createdAt: "2026-03-10",
    author: "加州项目组",
    readTime: "7 分钟阅读",
  },
  {
    title: "转学 GPA 不够高还能怎么补强",
    href: "#",
    description:
      "课程难度、学术项目、教授互动和文书叙事都能成为补强点，关键是证据链要完整。",
    image: "https://storage.efferd.com/creative/threads.webp",
    createdAt: "2026-03-02",
    author: "背景提升组",
    readTime: "5 分钟阅读",
  },
  {
    title: "港新插班申请的节奏差异",
    href: "#",
    description:
      "和美本转学相比，港新院校更看重哪些材料，时间安排上又该如何前置准备。",
    image: "https://storage.efferd.com/creative/hyperspeed.webp",
    createdAt: "2026-02-24",
    author: "亚洲项目组",
    readTime: "4 分钟阅读",
  },
  {
    title: "如何判断保底校是否真的保底",
    href: "#",
    description:
      "不要只看往年最低分。课程先修、国际生比例和转学名额波动都应该纳入判断。",
    image: "https://storage.efferd.com/creative/pixel-blast.webp",
    createdAt: "2026-02-18",
    author: "选校研究组",
    readTime: "6 分钟阅读",
  },
  {
    title: "从 waitlist 到补录的沟通模板",
    href: "#",
    description:
      "准备 follow-up 邮件、课程更新说明和新增成绩单，让补录阶段的信息补充更有节奏。",
    image: "https://storage.efferd.com/creative/floating-lines.webp",
    createdAt: "2026-02-09",
    author: "录取跟进组",
    readTime: "4 分钟阅读",
  },
  {
    title: "商科转学案例拆解",
    href: "#",
    description:
      "从先修课满足度、活动经历到 essay 结构，拆解一份商科转学 mock 档案的搭建思路。",
    image: "https://storage.efferd.com/creative/color-bends.webp",
    createdAt: "2026-01-30",
    author: "商科项目组",
    readTime: "5 分钟阅读",
  },
  {
    title: "系统如何管理多批次申请",
    href: "#",
    description:
      "把春季、秋季和不同地区批次拆分管理，让每位学生都能清楚看到当前材料状态。",
    image: "https://storage.efferd.com/creative/light-rays.webp",
    createdAt: "2026-01-20",
    author: "产品运营组",
    readTime: "6 分钟阅读",
  },
  {
    title: "家长最关心的转学问题",
    href: "#",
    description:
      "预算、风险、时间成本和毕业延迟如何解释清楚，这里用 mock 问答给出一套清晰说法。",
    image: "https://storage.efferd.com/creative/orb.webp",
    createdAt: "2026-01-12",
    author: "顾问支持组",
    readTime: "3 分钟阅读",
  },
];

export function BlogsSection() {
  return (
    <div className="mx-auto w-full max-w-5xl grow">
      <div className="space-y-1 px-4 py-8 md:px-6">
        <h1 className="font-semibold text-2xl tracking-wide md:text-4xl">
          转学案例库
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          用 mock 案例、申请洞察和材料策略，快速了解转学申请系统最常见的工作流。
        </p>
      </div>
      <FullWidthDivider contained={true} />
      <div className="z-10 grid p-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard {...blog} key={blog.title} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({
  title,
  description,
  createdAt,
  readTime,
  image,
  author,
  className,
  ...props
}: React.ComponentProps<"a"> & BlogType) {
  return (
    <a
      className={cn(
        "group cn-rounded flex flex-col gap-2 p-3 hover:bg-muted/50 active:bg-muted",
        className,
      )}
      key={title}
      {...props}
    >
      <LazyImage
        alt={title}
        className="transition-all duration-500 group-hover:scale-105"
        containerClassName="cn-rounded shadow-md outline outline-offset-3 outline-border/50"
        fallback="https://placehold.co/640x360?text=fallback-image"
        inView={true}
        ratio={16 / 9}
        src={image}
      />
      <div className="space-y-2 px-2 pb-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground group-hover:text-foreground sm:text-xs">
          <p>{author}</p>
          <div className="size-1 rounded-full bg-muted-foreground" />
          <p>{createdAt}</p>
          <div className="size-1 rounded-full bg-muted-foreground" />
          <p>{readTime}</p>
        </div>
        <h2 className="line-clamp-2 font-semibold text-lg">{title}</h2>
        <p className="line-clamp-3 text-muted-foreground text-sm group-active:text-foreground">
          {description}
        </p>
      </div>
    </a>
  );
}
