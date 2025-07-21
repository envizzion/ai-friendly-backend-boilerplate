# Cross-Domain Database Access Strategy - Pragmatic Approach

## Executive Summary

This document outlines a simplified approach to cross-domain database access that leverages Kysely's built-in type safety. Rather than creating artificial barriers between domains, we embrace direct database queries while maintaining architectural boundaries through conventions and code review.

## Core Philosophy

### Kysely Changes the Game

Traditional architectures create complex type boundaries to prevent accidental cross-domain access. However, Kysely already provides compile-time guarantees that prevent:
- Querying non-existent tables
- Selecting non-existent columns
- Joining incompatible types
- Using incorrect data types

This shifts our focus from preventing accidents to making intentional architectural decisions.

### Simplified Principles

**Read Freely, Write Responsibly**: Any repository can read from any table for performance, but should only write to tables within its domain.

**Optimize First**: Start with efficient JOIN queries rather than multiple round-trips. The N+1 query problem has real performance costs.

**Convention Over Configuration**: Use team agreements and code review rather than complex type restrictions to maintain boundaries.

**Business Logic in Services**: Repositories handle data access efficiently; services handle business rules and orchestration.

## Architectural Approach

### Unified Type System

Use a single database type that combines all domains. This simplifies development while Kysely maintains type safety. No need for complex type gymnastics or artificial restrictions.

### Repository Responsibilities

**Primary Focus**: Efficient data access with optimal query patterns

**Read Operations**: 
- Free to JOIN across any tables for performance
- Create specialized query methods for common patterns
- Optimize for single database round-trips
- Leverage database capabilities fully

**Write Operations**:
- Only modify tables within the repository's domain
- Maintain clear ownership of data
- Use transactions for consistency
- Never update another domain's tables directly

### Service Layer Responsibilities

**Primary Focus**: Business logic and domain orchestration

**Key Responsibilities**:
- Implement business rules and validations
- Coordinate multi-domain operations
- Handle complex workflows
- Manage transaction boundaries
- Trigger cross-domain side effects

**Service Patterns**:
- Call repositories for efficient data access
- Call other services for cross-domain operations
- Encapsulate business logic away from data access
- Maintain domain boundaries for writes

## Implementation Guidelines

### When to Use Direct Cross-Domain Queries

**Ideal Use Cases**:
- Dashboard and reporting features requiring aggregated data
- Search functionality spanning multiple domains
- List views with related information
- Any read operation where N+1 queries would occur
- Performance-critical user-facing features

**Performance Considerations**:
- JOINs are typically 10-100x faster than multiple queries
- Single round-trip reduces network latency
- Database optimizers work best with complete queries
- Memory usage is more efficient with single result sets

### When to Maintain Separation

**Write Operations**:
- Each domain owns its data modifications
- Updates go through the owning domain's service
- Multi-domain updates use service orchestration
- Maintain audit trails within domains

**Complex Business Logic**:
- When intermediate processing is required
- When different caching strategies apply
- When business rules span domains
- When external service calls are needed

**Team Boundaries**:
- When different teams own different domains
- When deployment schedules differ
- When scaling requirements vary
- When regulatory compliance requires separation

## Benefits of This Approach

### Performance Benefits

**Dramatic Speed Improvements**: Eliminating N+1 queries provides order-of-magnitude performance gains. What took 500ms with separate queries takes 50ms with a JOIN.

**Reduced Infrastructure Load**: Fewer database connections, less network traffic, and lower memory usage translate to reduced infrastructure costs.

**Better User Experience**: Faster response times directly impact user satisfaction and engagement.

### Developer Experience Benefits

**Simplified Mental Model**: Developers think in terms of data relationships, not artificial boundaries.

**Faster Development**: Less boilerplate code and fewer abstraction layers mean features ship faster.

**Easier Debugging**: Direct queries are easier to understand, profile, and optimize.

**Type Safety Without Complexity**: Kysely provides guarantees without additional type system complexity.

### Maintenance Benefits

**Less Code to Maintain**: Fewer abstraction layers mean less code overall.

**Clearer Intent**: Queries directly express what data is needed.

**Easier Optimization**: Performance bottlenecks are easier to identify and fix.

**Flexible Evolution**: Architecture can evolve based on real needs rather than theoretical concerns.

## Anti-Patterns to Avoid

### Over-Engineering
- Creating complex type restrictions when Kysely already provides safety
- Adding abstraction layers that provide no clear benefit
- Optimizing for problems that don't exist yet
- Building for imaginary future requirements

### Under-Engineering
- Putting business logic in repositories
- Writing to other domains' tables directly
- Ignoring performance implications
- Skipping code review for cross-domain changes

### Process Anti-Patterns
- Not measuring actual performance
- Optimizing without data
- Creating boundaries without clear ownership
- Allowing domain logic to leak across boundaries

## Team Guidelines

### Code Review Focus Areas

**For Cross-Domain Reads**: Is this the most efficient query pattern? Are indexes being used effectively? Is the query result being used appropriately?

**For Write Operations**: Does this repository only write to its own domain? Are multi-domain updates properly orchestrated? Is the transaction boundary appropriate?

**For New Features**: Could this benefit from direct queries? Is the domain boundary clear? Are we solving real problems or imaginary ones?

### Documentation Requirements

**Repository Methods**: Document which tables are queried and why. Explain any complex JOIN patterns. Note performance characteristics.

**Service Methods**: Document business rules and validations. Explain multi-domain orchestration. Clarify transaction boundaries.

**Domain Boundaries**: Maintain clear documentation of which team owns which tables. Document any special cross-domain agreements. Keep architecture decision records updated.

## Evolution Strategy

### Near Term
Focus on delivering features with optimal performance. Use direct queries where they provide value. Maintain write boundaries through convention. Measure and document query patterns.

### Medium Term
Identify common query patterns for standardization. Extract reusable query builders if patterns emerge. Consider read models for complex aggregations. Optimize based on real usage data.

### Long Term
Evaluate if domain boundaries need adjustment. Consider CQRS if read/write patterns diverge significantly. Assess need for separate databases per domain. Plan for event-driven architecture if coupling becomes problematic.

## Success Metrics

### Performance Metrics
- Query execution time per endpoint
- Database round-trips per request
- Response time percentiles
- Infrastructure resource usage

### Quality Metrics
- Cross-domain write violations (should be zero)
- Code review turnaround time
- Bug rates related to data access
- Developer satisfaction scores

### Business Metrics
- Feature delivery velocity
- System reliability scores
- User satisfaction ratings
- Infrastructure cost per transaction

## Conclusion

By leveraging Kysely's type safety and embracing pragmatic query patterns, we can build a system that is both performant and maintainable. The key insights are:

1. Type safety is already solved by Kysely - focus on business problems
2. Performance matters - N+1 queries have real costs
3. Conventions and code review can maintain boundaries effectively
4. Simplicity leads to better outcomes than complex abstractions

This approach allows us to deliver features faster, with better performance, while maintaining the architectural boundaries that truly matter for long-term system health. The result is a system that serves users well while remaining a joy to work with for developers.