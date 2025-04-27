// pages/api/knowledge/[category].js

export default function handler(req, res) {
    const { category } = req.query;
  
    const knowledgeDB = {
      Cars: [
        {
          id: 1,
          title: "Understanding ADAS in Modern Cars",
          content_type: "research_paper",
          published_date: "2024-10-12",
          url: "https://example.com/adas.pdf",
          thumbnail_url: "/thumbnails/adas.png",
          content: "Advanced Driver-Assistance Systems (ADAS) enhance vehicle safety and driving experience..."
        },
        {
          id: 2,
          title: "The Future of Autonomous Vehicles",
          content_type: "video",
          published_date: "2024-09-01",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnail_url: "/thumbnails/autonomous.png",
          content: ""
        }
      ],
      Wearables: [
        {
          id: 3,
          title: "Evolution of Laptop Hardware",
          content_type: "article",
          published_date: "2024-08-20",
          url: "https://example.com/laptop-hardware",
          thumbnail_url: "/thumbnails/laptop.png",
          content: "Laptops have transformed with advancements in processors, battery life, and portability..."
        }
      ]
    };
  
    const data = knowledgeDB[category] || [];
  
    res.status(200).json(data);
  }
  