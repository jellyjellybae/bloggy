/* eslint-disable @next/next/no-img-element */
import  moment from "moment";
import styles from '../../styles/Slug.module.css'
import { GraphQLClient, gql } from 'graphql-request';
const hygraph = new GraphQLClient("https://api-us-east-1.hygraph.com/v2/cl67vdvmecoq401uk6jz4enuq/master")
const QUERY = gql`
query Post($slug: String!) {
  post(where: { slug: $slug }) {
    id
    title
    slug
    datePublished
    author {
      id
      name
      avatar {
        url
      }
    }
    content {
      html
    }
    coverPhoto {
      id
      url
    }
  }
}
`;
const SLUGLIST = gql`
{
    posts{
        slug
    }
}`;
export async function getStaticPaths() {
  // paths:['macdonalds,jamstack-lists']
  const { posts } = await hygraph.request(SLUGLIST);
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false,
  };
}


export async function getStaticProps({ params }) {

  const slug = params.slug;
  const data = await hygraph.request(QUERY, { slug });
  const post = data.post;
  return {
    props: {
      post,
    },
    revalidate: 10,
  };
}
export default function BlogPost({ post }) {
  return (
    <main className={styles.blog}>
      <img
        className={styles.cover}
        src={post.coverPhoto.url}
        alt={post.title}
      />
      <div className={styles.title}>
        <div className={styles.authdetails}>
          <img src={post.author.avatar.url} alt={post.author.name} />
          <div className={styles.authtext}>
            <h6>By {post.author.name} </h6>
            <h6 className={styles.date}>
              {moment(post.datePublished).format("MMMM d, YYYY")}
            </h6>
          </div>
        </div>
        <h2>{post.title}</h2>
      </div>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      ></div>
    </main>
  );
}