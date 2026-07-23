import { ArrowRight } from "lucide-react";
import { posts, postCategories, postSeries } from "../lib/generated/posts.js";
import { appPath } from "../lib/publicRouting.js";
import { HTMLContent, NotFoundPage, PageHeader } from "./routePrimitives.jsx";

export function blogIndexRoute() {
  return {
    meta: {
      title: "Codaro 소식",
      description: "Codaro 제품 방향, 출시 준비, 운영 기록을 담은 글.",
      url: "/docs/blog",
    },
    element: <BlogIndexPage />,
  };
}

function BlogIndexPage() {
  const [featuredPost, ...restPosts] = posts;
  return (
    <main className="pageShell blogShell">
      <PageHeader
        eyebrow="Codaro 소식"
        title="학습, 실행, 자동화가 어떻게 하나의 제품이 되는지 기록한다."
        copy="Codaro 소식은 단순 공지가 아니라 제품 판단, 출시 준비, 로컬 런타임 운영 기준을 남기는 공개 기록이다."
      />
      {featuredPost ? <FeaturedPost post={featuredPost} /> : null}
      <TaxonomyBar categories={postCategories} series={postSeries} />
      <PostGrid posts={restPosts.length ? restPosts : posts} />
    </main>
  );
}

export function blogCategoryRoute(category) {
  const matched = posts.filter((post) => post.category === category);
  const label = matched[0]?.categoryLabel || category;
  return {
    meta: {
      title: `${label} 글`,
      description: `${label} 카테고리의 Codaro 글 목록.`,
      url: `/docs/blog/category/${category}`,
    },
    element: (
      <main className="pageShell">
        <PageHeader eyebrow="Category" title={label} copy="같은 카테고리의 공개 글을 모았다." />
        <PostGrid posts={matched} />
      </main>
    ),
  };
}

export function blogSeriesRoute(series) {
  const matched = posts.filter((post) => post.series === series);
  const label = matched[0]?.seriesLabel || series;
  return {
    meta: {
      title: `${label} 시리즈`,
      description: `${label} 시리즈 글 목록.`,
      url: `/docs/blog/series/${series}`,
    },
    element: (
      <main className="pageShell">
        <PageHeader eyebrow="Series" title={label} copy="같은 흐름으로 이어지는 글을 모았다." />
        <PostGrid posts={matched} />
      </main>
    ),
  };
}

export function blogPostRoute(slug) {
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) {
    return {
      meta: { title: "글을 찾을 수 없음", description: "요청한 Codaro 글을 찾을 수 없습니다.", url: `/docs/blog/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: post.title, description: post.description, url: post.url, type: "article" },
    element: <BlogPostPage post={post} />,
  };
}

function BlogPostPage({ post }) {
  return (
    <main className="articleLayout compact">
      <aside className="articleRail">
        <a href={appPath("/docs/blog")}>Codaro 소식</a>
        <a href={appPath(`/docs/blog/category/${post.category}`)}>{post.categoryLabel}</a>
        <a href={appPath(`/docs/blog/series/${post.series}`)}>{post.seriesLabel || post.series}</a>
      </aside>
      <article className="proseArticle">
        <div className="articleHero">
          <p className="eyebrow">{post.categoryLabel}</p>
          <h1>{post.title}</h1>
          <p className="articleDescription">{post.description}</p>
          <div className="articleMeta">
            <span>{post.date}</span>
            <span>{post.seriesLabel || post.series}</span>
          </div>
        </div>
        <HTMLContent html={post.html} />
      </article>
    </main>
  );
}

function FeaturedPost({ post }) {
  return (
    <section className="featuredPost" aria-label="대표 글">
      <img src={post.cardPreview} alt="" />
      <div className="featuredPostBody">
        <p className="eyebrow">Featured writing</p>
        <h2>{post.title}</h2>
        <span>{post.description}</span>
        <div className="featuredMeta">
          <span>{post.categoryLabel}</span>
          <span>{post.date}</span>
          <span>{post.seriesLabel || post.series}</span>
        </div>
        <a href={appPath(post.url)}>
          대표 글 읽기
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function TaxonomyBar({ categories, series }) {
  return (
    <div className="taxonomyBar">
      {categories.map((category) => (
        <a href={appPath(`/docs/blog/category/${category.slug}`)} key={category.slug}>
          {category.label}
        </a>
      ))}
      {series.map((item) => (
        <a href={appPath(`/docs/blog/series/${item.slug}`)} key={item.slug}>
          {item.label} 시리즈
        </a>
      ))}
    </div>
  );
}

function PostGrid({ posts: visiblePosts }) {
  if (!visiblePosts.length) return <p className="emptyState">아직 공개된 글이 없습니다.</p>;
  return (
    <div className="postGrid">
      {visiblePosts.map((post) => (
        <article className="postCard" key={post.slug}>
          <img src={post.cardPreview} alt="" />
          <div>
            <p>{post.categoryLabel}</p>
            <h2>{post.title}</h2>
            <span>{post.description}</span>
            <a href={appPath(post.url)}>
              읽기
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
