// RSS Feed Testing Script
// Save as: scripts/test-feeds.ts
// Run with: npx tsx scripts/test-feeds.ts

import { fetchAndParseNews, getNewsStats } from '../lib/news/newsParser';
import { getEnabledFeeds, getFeedStatus } from '../lib/news/rssFeeds';

async function testAllFeeds() {
  console.log('🧪 Testing RSS Feed System\n');
  console.log('=' .repeat(50));
  
  // Show feed status
  const feedStatus = getFeedStatus();
  console.log(`📊 Feed Status:`);
  console.log(`   Total feeds: ${feedStatus.total}`);
  console.log(`   Enabled feeds: ${feedStatus.enabled}`);
  console.log(`   Disabled feeds: ${feedStatus.disabled}`);
  console.log(`   Categories: ${feedStatus.categories.join(', ')}`);
  console.log(`   Avg credibility: ${feedStatus.avgCredibility.toFixed(2)}\n`);
  
  // List enabled feeds
  const enabledFeeds = getEnabledFeeds();
  console.log(`🔗 Enabled RSS Feeds (${enabledFeeds.length}):`);
  enabledFeeds.forEach((feed, index) => {
    console.log(`   ${index + 1}. ${feed.name}`);
    console.log(`      URL: ${feed.url}`);
    console.log(`      Category: ${feed.category} | Credibility: ${feed.credibility}`);
    console.log('');
  });
  
  console.log('🔄 Starting news fetch test...\n');
  
  try {
    const startTime = Date.now();
    
    // Test news fetching
    const articles = await fetchAndParseNews({
      maxArticlesPerFeed: 5,
      maxTotalArticles: 50,
      minConfidence: 0.3,
      maxAgeHours: 24,
      enableDeduplication: true
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`✅ News fetch completed in ${processingTime}ms\n`);
    
    if (articles.length === 0) {
      console.log('❌ No articles were fetched. This indicates a problem with the RSS feeds.');
      console.log('💡 Troubleshooting steps:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify that the RSS URLs are accessible');
      console.log('   3. Check if any feeds are being blocked by firewalls');
      console.log('   4. Try running the test again in a few minutes');
      return;
    }
    
    // Generate statistics
    const stats = getNewsStats(articles);
    
    console.log(`📈 Results Summary:`);
    console.log(`   Total articles: ${stats.total}`);
    console.log(`   Avg relevance score: ${stats.avgRelevanceScore.toFixed(2)}`);
    console.log(`   Avg tickers per article: ${stats.avgTickersPerArticle.toFixed(1)}`);
    console.log('');
    
    console.log(`😊 Sentiment Distribution:`);
    console.log(`   Positive: ${(stats.sentimentDistribution.positive * 100).toFixed(1)}%`);
    console.log(`   Negative: ${(stats.sentimentDistribution.negative * 100).toFixed(1)}%`);
    console.log(`   Neutral: ${(stats.sentimentDistribution.neutral * 100).toFixed(1)}%`);
    console.log('');
    
    console.log(`📂 Category Distribution:`);
    Object.entries(stats.categoryDistribution).forEach(([category, count]) => {
      const percentage = ((count as number) / stats.total * 100).toFixed(1);
      console.log(`   ${category}: ${count} articles (${percentage}%)`);
    });
    console.log('');
    
    console.log(`🏆 Top Sources:`);
    stats.topSources.forEach((source, index) => {
      console.log(`   ${index + 1}. ${source.source}: ${source.count} articles`);
    });
    console.log('');
    
    // Show sample articles
    console.log(`📰 Sample Articles (showing first 5):`);
    articles.slice(0, 5).forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Source: ${article.source} | Category: ${article.category}`);
      console.log(`      Sentiment: ${article.sentiment} | Relevance: ${article.relevanceScore.toFixed(2)}`);
      if (article.tickers && article.tickers.length > 0) {
        console.log(`      Tickers: ${article.tickers.join(', ')}`);
      }
      console.log(`      Published: ${new Date(article.publishedAt).toLocaleString()}`);
      console.log(`      Summary: ${article.summary.substring(0, 100)}...`);
      console.log('');
    });
    
    // Performance assessment
    console.log(`⚡ Performance Assessment:`);
    if (processingTime < 10000) {
      console.log(`   🟢 Excellent: ${processingTime}ms (under 10 seconds)`);
    } else if (processingTime < 20000) {
      console.log(`   🟡 Good: ${processingTime}ms (10-20 seconds)`);
    } else {
      console.log(`   🔴 Slow: ${processingTime}ms (over 20 seconds)`);
      console.log(`   💡 Consider reducing maxArticlesPerFeed or maxTotalArticles`);
    }
    
    // Quality assessment
    console.log('');
    console.log(`📊 Quality Assessment:`);
    const avgRelevance = stats.avgRelevanceScore;
    if (avgRelevance > 0.7) {
      console.log(`   🟢 High quality: Avg relevance ${avgRelevance.toFixed(2)}`);
    } else if (avgRelevance > 0.5) {
      console.log(`   🟡 Good quality: Avg relevance ${avgRelevance.toFixed(2)}`);
    } else {
      console.log(`   🔴 Low quality: Avg relevance ${avgRelevance.toFixed(2)}`);
      console.log(`   💡 Consider adjusting minConfidence or feed selection`);
    }
    
    // Recommendations
    console.log('');
    console.log(`💡 Recommendations:`);
    
    if (stats.total < 20) {
      console.log(`   - Consider enabling more RSS feeds to increase article count`);
    }
    
    if (stats.avgTickersPerArticle < 0.5) {
      console.log(`   - Ticker extraction might need improvement for financial content`);
    }
    
    if (stats.sentimentDistribution.neutral > 0.8) {
      console.log(`   - Sentiment analysis might need tuning for financial language`);
    }
    
    const categoryCount = Object.keys(stats.categoryDistribution).length;
    if (categoryCount < 3) {
      console.log(`   - Consider adding feeds from more diverse categories`);
    }
    
    console.log('\n✅ RSS Feed System Test Complete!');
    console.log('🚀 Your news feed should now be working properly.');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check if you have the required dependencies installed:');
    console.log('   npm install rss-parser date-fns');
    console.log('2. Verify your internet connection');
    console.log('3. Check if corporate firewall is blocking RSS feeds');
    console.log('4. Try running with different RSS feed configurations');
  }
}

// Quick individual feed test
async function testSingleFeed(feedName?: string) {
  const feeds = getEnabledFeeds();
  
  if (feedName) {
    const feed = feeds.find(f => f.name.toLowerCase().includes(feedName.toLowerCase()));
    if (!feed) {
      console.log(`❌ Feed not found: ${feedName}`);
      console.log('Available feeds:', feeds.map(f => f.name).join(', '));
      return;
    }
    
    console.log(`🔍 Testing single feed: ${feed.name}`);
    console.log(`URL: ${feed.url}\n`);
    
    try {
      // This would need to be implemented in the newsParser
      console.log('⚠️  Single feed testing requires additional implementation');
    } catch (error) {
      console.error(`❌ Failed to test ${feed.name}:`, error);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await testAllFeeds();
  } else if (args[0] === '--feed' && args[1]) {
    await testSingleFeed(args[1]);
  } else {
    console.log('Usage:');
    console.log('  npx tsx scripts/test-feeds.ts                    # Test all feeds');
    console.log('  npx tsx scripts/test-feeds.ts --feed "yahoo"     # Test specific feed');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { testAllFeeds, testSingleFeed };