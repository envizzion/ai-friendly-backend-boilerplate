# Breaking Changes Log

## Purpose

This document tracks all breaking changes made to the API during the pre-production phase. Since we're in early development without external users, we can make breaking changes freely to improve the API design.

**Current Status**: 🚧 Pre-Production - Breaking changes allowed

## Breaking Changes

### 2024-07-21 - Initial API Structure
- **Change**: Established feature-based API structure
- **Impact**: New API organization with domain-based endpoints
- **Endpoints**: 
  - `/api/core/*` - Catalog management
  - `/api/vendor/*` - Marketplace seller functionality  
  - `/api/customer/*` - Buyer functionality
  - `/api/common/*` - Shared services

### 2024-07-21 - Native ES Modules
- **Change**: Adopted Native ES Modules with `.js` extensions
- **Impact**: All imports must include `.js` extension
- **Migration**: Added `.js` to all local imports
- **Reason**: Better debugging, faster development iteration

---

## Future Breaking Changes Policy

### Pre-Production Phase (Current)
- ✅ **Breaking changes allowed** - Move fast and iterate
- ✅ **No backward compatibility needed**
- ✅ **Change APIs based on learnings**
- ✅ **Focus on finding the right API design**

### Early Production Phase (After first users)
- 🟡 **Switch to additive-only changes**
- 🟡 **Add fields as optional only**
- 🟡 **No field removal or renaming**
- 🟡 **Maintain backward compatibility**

### Scale Production Phase (Multiple clients)
- 🔴 **Add versioning if needed**
- 🔴 **Feature-level versioning preferred**
- 🔴 **Coordinate breaking changes carefully**

---

## Guidelines

### During Pre-Production
1. **Document all breaking changes** in this file
2. **Include date, change description, and reason**
3. **Don't worry about impact** - no external users yet
4. **Focus on API design quality** over compatibility

### Before First Users
1. **Finalize major API structure**
2. **Establish response formats**
3. **Set pagination patterns**
4. **Define error response structure**

### After First Users
1. **Stop adding breaking changes to this file**
2. **Switch to additive-only changes**
3. **Consider versioning only when truly needed**
4. **Monitor which APIs change frequently**

---

## Template for New Entries

```
### YYYY-MM-DD - Change Title
- **Change**: Brief description of what changed
- **Impact**: What this affects (endpoints, request/response format, etc.)
- **Reason**: Why this change was necessary
- **Migration**: How to update existing code (if any)
```

---

*Last updated: 2024-07-21*